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
import { MatchesQuery, MatchesQueryResult } from './matches.query';
import { Match, MatchStage, Party, WatchQueryResult } from 'app/graphql';
import { CommonModule } from '@angular/common';
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
import { localDateFrom, LocalStorage, Maybe } from 'app/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SavePredictionMutation } from './save-prediction.mutation';
import { OnboardingQuery } from './onboarding.query';
import { MarkHasSeenTutorialMutation } from './mark-has-seen-tutorial.mutation';
import { Session } from 'app/session';
import { MarkHasSeenWelcomeMutation } from './mark-has-seen-welcome.mutation';
import { PartyPredictionsModule } from './party-predictions';
import { PartiesQuery } from './parties.query';

type MatchBlock = {
  title: string;
  matches: Match[];
};

type MatchSortOption = 'upcoming' | 'past' | 'stage';

const STORAGE_PARTY_ID = 'leaderboards:partyId'; // XXX: Reusing leaderboards key on purpose

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
  selector: 'app-onboarding-welcome',
  template: `
    <app-card variant="striped">
      <app-card-section>
        <div class="tw-flex tw-flex-col tw-gap-y-2">
          <span class="tw-italic tw-text-center"
            >Hey there {{ name }} 👋🏻 Make sure you
            <a
              class="text-link tw-font-semibold"
              routerLink="/about"
              (click)="dismissed.emit()"
              >check out the rules</a
            >, and good luck!</span
          >
          <button type="button" app-button (click)="dismissed.emit()"
            >Got it</button
          >
        </div>
      </app-card-section>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingWelcomeComponent {
  @Input() name!: string;
  @Output() dismissed = new EventEmitter<void>();
}

@Component({
  selector: 'app-matches-page',
  template: `
    <section class="tw-flex tw-flex-col tw-flex-nowrap">
      <app-onboarding-welcome
        *ngIf="
          !!(session.isAuthenticated$ | async) &&
          (hasSeenWelcome$ | async) === false
        "
        class="tw-mb-6"
        [name]="(session.user$ | async)?.name ?? ''"
        (dismissed)="markHasSeenWelcome()"
      ></app-onboarding-welcome>

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
            <app-card
              *ngFor="let match of block.matches; let matchIndex = index"
              trackById
              class="animate-fadeInUp"
            >
              <app-card-section>
                <app-match
                  [match]="match"
                  (predictionChanged)="savePrediction(match.id, $event)"
                  [tutorial]="
                    blockIndex === 0 &&
                    matchIndex === 0 &&
                    match.isOpenForPredictions &&
                    !!(session.isAuthenticated$ | async) &&
                    (hasSeenTutorial$ | async) === false
                  "
                  (finishedTutorial)="markHasSeenTutorial()"
                ></app-match>
              </app-card-section>

              <!-- Party predictions -->
              <ng-container
                *ngIf="
                  ((parties$ | async)?.length ?? 0 > 0) &&
                  !match.isOpenForPredictions
                "
              >
                <app-collapse [collapsed]="!partyPredictionsOpen[match.id]">
                  <app-card-section class="tw-bg-gray-50">
                    <app-party-predictions
                      [matchId]="match.id"
                      [parties]="(parties$ | async) ?? []"
                      [selectedPartyId]="(selectedPartyId$ | async) ?? ''"
                      (partyChanged)="changeParty($event)"
                    ></app-party-predictions>
                  </app-card-section>
                </app-collapse>
                <app-menu class="tw-block tw-rounded-b-lg tw-overflow-hidden">
                  <button
                    type="button"
                    app-menu-item
                    class="tw-text-xs tw-uppercase tw-font-semibold"
                    (click)="
                      partyPredictionsOpen[match.id] =
                        !partyPredictionsOpen[match.id]
                    "
                    >What others guessed</button
                  >
                </app-menu>
              </ng-container>
            </app-card>
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

  private matchesQueryRef!: WatchQueryResult<MatchesQueryResult>;

  private readonly PAGE_SIZE = 12;
  private readonly limit$ = new BehaviorSubject(this.PAGE_SIZE);

  hasSeenWelcome$!: Observable<boolean>;
  hasSeenTutorial$!: Observable<boolean>;

  parties$!: Observable<Party[]>;
  selectedPartyId$ = new BehaviorSubject<Maybe<string>>(
    this.localStorage.get(STORAGE_PARTY_ID, void 0),
  );
  partyPredictionsOpen: Record<string, boolean> = {};

  private readonly destroy$ = new Subject<void>();

  constructor(
    public readonly session: Session,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly matchesQuery: MatchesQuery,
    private readonly savePredictionMutation: SavePredictionMutation,
    private readonly onbardingQuery: OnboardingQuery,
    private readonly markTutorialMutation: MarkHasSeenTutorialMutation,
    private readonly markWelcomeMutation: MarkHasSeenWelcomeMutation,
    private readonly partiesQuery: PartiesQuery,
    private readonly localStorage: LocalStorage,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.loadMatches();
    this.loadTutorials();
    this.loadParties();
  }

  private loadMatches(): void {
    this.matchesQueryRef = this.matchesQuery.watch();

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
      this.matchesQueryRef.data$.pipe(map(data => data.matches)),
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

    this.isLoading$ = this.matchesQueryRef.isLoading$;
  }

  private loadTutorials(): void {
    const onbardingQuery = this.onbardingQuery.watch();

    this.hasSeenWelcome$ = onbardingQuery.data$.pipe(
      map(data => data.me?.hasSeenWelcome ?? false),
    );
    this.hasSeenTutorial$ = onbardingQuery.data$.pipe(
      map(data => data.me?.hasSeenTutorial ?? false),
    );
  }

  private loadParties(): void {
    const partiesQuery = this.partiesQuery.watch();

    this.parties$ = partiesQuery.data$.pipe(
      map(data => data.me?.parties ?? []),
    );

    this.parties$.pipe(takeUntil(this.destroy$)).subscribe(parties => {
      if (parties.length > 0 && !this.selectedPartyId$.getValue()) {
        this.selectedPartyId$.next(parties[0].id);
      }
    });
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
        return stagePoints[b.stage] - stagePoints[a.stage];
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
      [MatchStage.QuaterFinal]: 'Quarter-Finals',
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
      this.session.login();
      return;
    }
    try {
      await this.savePredictionMutation.mutate({ input: { matchId, score } });
    } catch (error: any) {
      if (error?.code === 'match:closed-for-predictions') {
        alert('Sorry, this match has been closed for predictions.');
        this.matchesQueryRef?.refetch();
      } else {
        console.warn('Could not save prediction', error);
        // TODO: Show error
      }
    }
  }

  async markHasSeenWelcome(): Promise<void> {
    try {
      await this.markWelcomeMutation.mutate();
    } catch (error) {
      console.warn('Could not mark welcome as seen', error);
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

  changeParty(partyId: string): void {
    this.localStorage.set(STORAGE_PARTY_ID, partyId);
    this.selectedPartyId$.next(partyId);
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
    PartyPredictionsModule,
    RouterModule,
  ],
  declarations: [
    ...DIRECTIVES,
    MatchSortOptionsComponent,
    MatchesEmptyStateComponent,
    OnboardingWelcomeComponent,
  ],
  exports: DIRECTIVES,
})
export class MatchesPageModule {}
