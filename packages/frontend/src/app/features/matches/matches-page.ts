import {
  NgModule,
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  takeUntil,
} from 'rxjs/operators';
import { MatchesQuery } from './matches.query';
import { Match, MatchStage } from 'app/graphql';
import { CommonModule } from '@angular/common';
import { UIModule } from 'app/ui';
import { LayoutModule } from 'app/layout';
import { TrackByIdModule, TrackByModule } from 'ng-track-by';
import { MatchModule, Score } from './match';
import {
  isSameDay,
  format,
  startOfDay,
  isBefore,
  isAfter,
  isEqual,
} from 'date-fns';
import { localDateFrom } from 'app/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SavePredictionMutation } from './save-prediction.mutation';

type MatchBlock = {
  title: string;
  matches: Match[];
};

type MatchSortOption = 'upcoming' | 'past' | 'stage';

@Component({
  selector: 'app-match-sort-options',
  template: `
    <app-side-scroller class="tw-block -tw-mx-4">
      <div class="tw-pl-2"></div>
      <button
        type="button"
        app-button
        [pill]="true"
        [selected]="sortBy === 'upcoming'"
        (click)="select('upcoming')"
        >Upcoming Matches</button
      >
      <button
        type="button"
        app-button
        [pill]="true"
        [selected]="sortBy === 'past'"
        (click)="select('past')"
        >Past Matches</button
      >
      <button
        type="button"
        app-button
        [pill]="true"
        [selected]="sortBy === 'stage'"
        (click)="select('stage')"
        >By Stage</button
      >
      <div class="tw-pl-20 sm:tw-pl-2"></div>
    </app-side-scroller>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchSortOptionsComponent {
  @Input() sortBy!: MatchSortOption;

  @Output() changed = new EventEmitter<MatchSortOption>();

  select(sortBy: MatchSortOption): void {
    this.changed.emit(sortBy);
  }
}

@Component({
  selector: 'app-matches-empty-state',
  template: `
    <div class="tw-px-8 tw-py-16 tw-text-lg tw-text-center tw-text-muted">
      <ng-container *ngIf="sortBy === 'upcoming'">
        No upcoming matches at this time. Thanks for playing!
      </ng-container>
      <ng-container *ngIf="sortBy === 'past'">
        No matches have finished yet. Check back later :)
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchesEmptyStateComponent {
  @Input() sortBy!: MatchSortOption;
}

@Component({
  selector: 'app-matches-page',
  template: `
    <app-main-layout>
      <section class="tw-flex tw-flex-col tw-flex-nowrap">
        <app-match-sort-options
          [sortBy]="(sortBy$ | async) ?? 'upcoming'"
          (changed)="changeSort($event)"
          class="tw-py-4"
        ></app-match-sort-options>

        <ng-container *ngIf="!(isLoading$ | async)">
          <app-matches-empty-state
            *ngIf="(matchBlocks$ | async)?.length === 0"
            [sortBy]="(sortBy$ | async) ?? 'upcoming'"
            class="animate-fadeIn"
          ></app-matches-empty-state>

          <div
            *ngFor="let block of matchBlocks$ | async; let blockIndex = index"
            trackBy="title"
          >
            <h2
              class="tw-text-center tw-p-4 tw-font-semibold tw-text-muted sticky-block animate-fadeInUp"
              >{{ block.title }}</h2
            >

            <div
              class="tw-flex tw-flex-col tw-flex-nowrap tw-gap-y-8 tw-mt-2 tw-mb-8"
            >
              <!-- TODO: Show tutorial only the first time, with flags -->
              <app-match
                *ngFor="let match of block.matches; let matchIndex = index"
                trackById
                class="animate-fadeInUp"
                [match]="match"
                [tutorial]="
                  match.isOpenForPredictions &&
                  blockIndex === 0 &&
                  matchIndex === 0
                "
                (predictionChanged)="savePrediction(match.id, $event)"
              ></app-match>
            </div>
          </div>

          <div
            *ngIf="hasMore$ | async"
            class="tw-flex tw-items-center tw-justify-center tw-py-8"
          >
            <button type="button" app-button (click)="loadMore()"
              >View More</button
            >
          </div>
        </ng-container>
      </section>
    </app-main-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchesPageComponent implements OnInit, OnDestroy {
  matchBlocks$!: Observable<MatchBlock[]>;
  hasMore$!: Observable<boolean>;
  isLoading$!: Observable<boolean>;
  sortBy$!: Observable<MatchSortOption>;

  private readonly PAGE_SIZE = 12;
  private readonly limit$ = new BehaviorSubject(this.PAGE_SIZE);

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly matchesQuery: MatchesQuery,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly savePredictionMutation: SavePredictionMutation,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    const { data$, isLoading$ } = this.matchesQuery.watch();

    this.sortBy$ = this.route.fragment.pipe(
      map(
        fragment =>
          fragment === 'upcoming'
            ? 'upcoming'
            : fragment === 'past'
            ? 'past'
            : fragment === 'stage'
            ? 'stage'
            : 'upcoming', // default
      ),
      distinctUntilChanged(),
    );

    this.sortBy$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.limit$.next(this.PAGE_SIZE));

    const matches$ = combineLatest([
      data$.pipe(map(data => data.matches)),
      this.sortBy$,
    ]).pipe(
      map(([matches, sortBy]) => {
        const today = startOfDay(new Date());

        if (sortBy === 'upcoming') {
          matches = matches.filter(match => {
            const startsAt = localDateFrom(match.startsAt);
            return isEqual(startsAt, today) || isAfter(startsAt, today);
          });
        } else if (sortBy === 'past') {
          matches = matches.filter(match => {
            const startsAt = localDateFrom(match.startsAt);
            return isEqual(startsAt, today) || isBefore(startsAt, today);
          });
        }
        return matches;
      }),
    );

    this.matchBlocks$ = combineLatest([
      matches$,
      this.sortBy$,
      this.limit$,
    ]).pipe(
      debounceTime(0),
      map(([matches, sortBy, limit]) => {
        if (sortBy === 'stage') {
          matches = this.sortByStage(matches);
          matches = matches.slice(0, limit);
          return this.groupByStage(matches);
        } else if (sortBy === 'past') {
          matches = matches.slice().reverse().slice(0, limit);
          return this.groupByDate(matches);
        } else {
          matches = matches.slice(0, limit);
          return this.groupByDate(matches);
        }
      }),
    );

    this.hasMore$ = combineLatest([
      matches$.pipe(map(matches => matches.length)),
      this.matchBlocks$.pipe(
        map(blocks => blocks.reduce((total, b) => total + b.matches.length, 0)),
      ),
    ]).pipe(map(([available, visible]) => available > visible));

    this.isLoading$ = isLoading$;
  }

  changeSort(sortBy: MatchSortOption): void {
    this.router.navigate(['./'], { fragment: sortBy });
  }

  private sortByStage(matches: Match[]): Match[] {
    const stagePoints = {
      [MatchStage.Regular]: 0,
      [MatchStage.Group]: 1,
      [MatchStage.RoundOf16]: 2,
      [MatchStage.QuaterFinal]: 3,
      [MatchStage.SemiFinal]: 4,
      [MatchStage.ThirdPlace]: 5,
      [MatchStage.Final]: 6,
    };
    return matches.slice().sort((a, b) => {
      if (a.stage !== b.stage) {
        return stagePoints[a.stage] - stagePoints[b.stage];
      }
      if (
        a.stage === MatchStage.Group &&
        !!a.group &&
        !!b.group &&
        a.group !== b.group
      ) {
        return a.group < b.group ? -1 : 1;
      }
      return a.startsAt < b.startsAt ? -1 : 1;
    });
  }

  private groupByDate(matches: Match[]): MatchBlock[] {
    let prevDate: Date | undefined;
    let block: MatchBlock | undefined;
    const blocks: MatchBlock[] = [];

    for (const match of matches) {
      const startsAt = localDateFrom(match.startsAt);
      if (!block || !prevDate || !isSameDay(prevDate, startsAt)) {
        prevDate = startsAt;
        block = {
          title: format(startsAt, 'EEEE MMMM d'),
          matches: [match],
        };
        blocks.push(block);
      } else {
        block.matches.push(match);
      }
    }

    return blocks;
  }

  private groupByStage(matches: Match[]): MatchBlock[] {
    let prevTitle: string | undefined;
    let block: MatchBlock | undefined;
    const blocks: MatchBlock[] = [];

    const stageTitles = {
      [MatchStage.Regular]: 'Season',
      [MatchStage.Group]: 'Group',
      [MatchStage.RoundOf16]: 'Round of 16',
      [MatchStage.QuaterFinal]: 'Quater-Finals',
      [MatchStage.SemiFinal]: 'Semi-Finals',
      [MatchStage.ThirdPlace]: 'Third Place',
      [MatchStage.Final]: 'Final',
    };

    for (const match of matches) {
      const title = `${stageTitles[match.stage]}${
        match.stage === MatchStage.Group ? ` ${match.group}` ?? '' : ''
      }`;
      if (!block || !prevTitle || prevTitle !== title) {
        prevTitle = title;
        block = {
          title,
          matches: [match],
        };
        blocks.push(block);
      } else {
        block.matches.push(match);
      }
    }

    return blocks;
  }

  loadMore(): void {
    const limit = this.limit$.getValue();
    this.limit$.next(limit + this.PAGE_SIZE);
  }

  async savePrediction(matchId: string, score: Score): Promise<void> {
    try {
      await this.savePredictionMutation.mutate({ input: { matchId, score } });
    } catch (error) {
      console.warn('Could not save prediction', error);
      // TODO: Show error
    }
  }
}

const DIRECTIVES = [MatchesPageComponent];

@NgModule({
  imports: [
    CommonModule,
    UIModule,
    LayoutModule,
    TrackByModule,
    TrackByIdModule,
    MatchModule,
  ],
  declarations: [
    ...DIRECTIVES,
    MatchSortOptionsComponent,
    MatchesEmptyStateComponent,
  ],
  exports: DIRECTIVES,
})
export class MatchesPageModule {}
