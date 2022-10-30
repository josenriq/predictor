import {
  NgModule,
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  Inject,
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
import { CommonModule, DOCUMENT } from '@angular/common';
import { UIModule } from 'app/ui';
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
import { OnboardingQuery } from './onboarding.query';
import { MarkHasSeenTutorialMutation } from './mark-has-seen-tutorial.mutation';
import { Session } from 'app/session';

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
        [selected]="sortBy === 'stage'"
        (click)="select('stage')"
        >By Stage</button
      >
      <button
        type="button"
        app-button
        [pill]="true"
        [selected]="sortBy === 'past'"
        (click)="select('past')"
        >Past Matches</button
      >
      <div class="tw-pr-20 md:tw-pr-2"></div>
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
    <div class="tw-px-8 tw-py-16 tw-text-center tw-text-muted">
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
    <section class="tw-flex tw-flex-col tw-flex-nowrap">
      <app-match-sort-options
        [sortBy]="(sortBy$ | async) ?? 'upcoming'"
        (changed)="changeSort($event)"
        class="tw-pb-4"
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
          <div
            class="tw-text-center tw-p-4 tw-font-semibold tw-text-muted sticky-block animate-fadeInUp"
            >{{ block.title }}</div
          >

          <div
            class="tw-flex tw-flex-col tw-flex-nowrap tw-gap-y-8 tw-mt-2 tw-mb-8"
          >
            <app-match
              *ngFor="let match of block.matches; let matchIndex = index"
              trackById
              class="animate-fadeInUp"
              [match]="match"
              (predictionChanged)="savePrediction(match.id, $event)"
              [tutorial]="
                blockIndex === 0 &&
                matchIndex === 0 &&
                match.isOpenForPredictions &&
                (hasSeenTutorial$ | async) === false
              "
              (finishedTutorial)="markHasSeenTutorial()"
            ></app-match>
          </div>
        </div>

        <div
          *ngIf="(hasMore$ | async) && !(isLoading$ | async)"
          class="tw-flex tw-flex-row tw-items-center tw-justify-center tw-py-8"
        >
          <button type="button" app-button (click)="loadMore()"
            >View More</button
          >
        </div>
      </ng-container>
    </section>
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

  hasSeenTutorial$!: Observable<boolean>;

  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly session: Session,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly matchesQuery: MatchesQuery,
    private readonly savePredictionMutation: SavePredictionMutation,
    private readonly onbardingQuery: OnboardingQuery,
    private readonly markTutorialMutation: MarkHasSeenTutorialMutation,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.loadMatches();
    this.loadTutorials();
  }

  private loadMatches(): void {
    const matchesQuery = this.matchesQuery.watch();

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
      matchesQuery.data$.pipe(map(data => data.matches)),
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

    this.isLoading$ = matchesQuery.isLoading$;
  }

  private loadTutorials(): void {
    const onbardingQuery = this.onbardingQuery.watch();

    this.hasSeenTutorial$ = onbardingQuery.data$.pipe(
      map(data => data.me?.hasSeenTutorial ?? false),
    );
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
    if (!(await this.session.isAuthenticated())) {
      // TODO: Show modal
      this.document.location = this.session.loginUrl;
      return;
    }
    try {
      await this.savePredictionMutation.mutate({ input: { matchId, score } });
    } catch (error) {
      console.warn('Could not save prediction', error);
      // TODO: Show error
    }
  }

  async markHasSeenTutorial(): Promise<void> {
    if (!(await this.session.isAuthenticated())) {
      // Ignore, no need to save
      return;
    }
    try {
      await this.markTutorialMutation.mutate();
    } catch (error) {
      console.warn('Could not mark tutorial as seen', error);
    }
  }
}

const DIRECTIVES = [MatchesPageComponent];

@NgModule({
  imports: [
    CommonModule,
    UIModule,
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
