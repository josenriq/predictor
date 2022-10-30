import {
  NgModule,
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { lastValueFrom, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { RankingsQuery } from './rankings.query';
import { CommonModule } from '@angular/common';
import { UIModule } from 'app/ui';
import { TrackByModule } from 'ng-track-by';
import { Session } from 'app/session';
import { Party, TournamentEntry, WatchQueryResult } from 'app/graphql';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PartiesQuery } from './parties.query';
import { Maybe } from 'app/core';

type Ranking = TournamentEntry & {
  position: number;
};

@Component({
  selector: 'app-ranking-position',
  template: `
    <div
      class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-justify-center tw-w-9"
    >
      <span class="tw-text-sm tw-pr-0.5">#</span>
      <span class="tw-text-2xl">{{ position }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingPositionComponent {
  @Input() position!: number;
}

@Component({
  selector: 'app-ranking',
  template: `
    <div class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-gap-x-3">
      <app-ranking-position
        class="tw-text-brand"
        [position]="ranking.position"
      ></app-ranking-position>
      <div
        class="tw-flex tw-flex-row tw-items-center tw-gap-x-2 tw-flex-1 tw-truncate"
      >
        <app-avatar
          size="sm"
          [name]="ranking.user.name"
          [picture]="ranking.user.picture"
        ></app-avatar>
        <div class="tw-truncate tw-text-lg">{{ ranking.user.name }}</div>
      </div>
      <app-points [points]="ranking.points"></app-points>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingComponent {
  @Input() ranking!: Ranking;
}

@Component({
  selector: 'app-party-selector',
  template: `
    <div class="select-wrapper">
      <select
        #partySelect
        class="select-lg"
        (change)="select(partySelect.value)"
      >
        <option [selected]="!selectedPartyId" [value]="worldwideParty"
          >🌎 Worldwide</option
        >
        <option
          *ngFor="let party of parties"
          [value]="party.id"
          [selected]="selectedPartyId === party.id"
          >{{ party.name }}</option
        >
      </select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartySelectorComponent {
  @Input() selectedPartyId: Maybe<string>;
  @Input() parties: Party[] = [];

  @Output() changed = new EventEmitter<Maybe<string>>();

  public readonly worldwideParty = 'WORLDWIDE';

  select(partyId: Maybe<string>): void {
    this.changed.emit(partyId === this.worldwideParty ? void 0 : partyId);
  }
}

@Component({
  selector: 'app-leaderboards-page',
  template: `
    <section class="tw-flex tw-flex-col tw-flex-nowrap">
      <app-party-selector
        class="tw-pb-4"
        [parties]="(parties$ | async) ?? []"
        [selectedPartyId]="selectedPartyId$ | async"
        (changed)="changeParty($event)"
      ></app-party-selector>

      <!-- <div *ngIf="!(isLoading$ | async) && (rankings$ | async).length === 0" -->

      <app-list *ngIf="(rankings$ | async)?.length ?? 0 > 0">
        <app-list-item
          *ngFor="let ranking of rankings$ | async"
          trackBy="user.id"
          class="animate-fadeInUp"
          [highlighted]="ranking.user.id === (session.user$ | async)?.id"
        >
          <app-ranking [ranking]="ranking"></app-ranking>
        </app-list-item>
      </app-list>

      <div
        *ngIf="hasMore$ | async"
        class="tw-flex tw-flex-row tw-items-center tw-justify-center tw-py-8"
      >
        <button type="button" app-button (click)="loadMore()">View More</button>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardsPageComponent implements OnInit, OnDestroy {
  query!: WatchQueryResult<unknown>;
  rankings$!: Observable<Ranking[]>;
  hasMore$!: Observable<boolean>;
  isLoading$!: Observable<boolean>;

  parties$!: Observable<Party[]>;
  selectedPartyId$!: Observable<Maybe<string>>;

  private readonly PAGE_SIZE = 20;
  private pageNumber = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    public readonly session: Session,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly rankingsQuery: RankingsQuery,
    private readonly partiesQuery: PartiesQuery,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.loadParties();

    this.selectedPartyId$ = this.route.params.pipe(
      map(params => params['partyId']),
    );

    this.selectedPartyId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(partyId => this.loadLeaderboard(partyId));
  }

  private loadParties(): void {
    const query = this.partiesQuery.watch();
    this.parties$ = query.data$.pipe(map(data => data.me?.parties ?? []));
  }

  private loadLeaderboard(partyId: Maybe<string>): void {
    this.pageNumber = 0;

    const query = this.rankingsQuery.watch({
      input: { pageSize: this.PAGE_SIZE, pageNumber: this.pageNumber, partyId },
    });

    this.query = query;

    this.rankings$ = query.data$.pipe(
      map(data => {
        const entries = data.rankings.results;
        const rankings: Array<Ranking> = [];

        let prevPoints = Infinity;
        let currentPos = 0;

        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];

          if (entry.points < prevPoints) {
            currentPos = i + 1;
            prevPoints = entry.points;
          }

          rankings.push({
            ...entry,
            position: currentPos,
          });
        }
        return rankings;
      }),
    );

    this.hasMore$ = query.data$.pipe(map(data => data.rankings.hasMore));

    this.isLoading$ = query.isLoading$;
  }

  changeParty(partyId: Maybe<string>): void {
    const path = ['/leaderboards']; // TODO: Make this relative somehow
    if (partyId) {
      path.push(partyId);
    }
    this.router.navigate(path);
  }

  async loadMore(): Promise<void> {
    const partyId = await lastValueFrom(this.selectedPartyId$);
    this.pageNumber++;

    this.query.fetchMore({
      input: { pageSize: this.PAGE_SIZE, pageNumber: this.pageNumber, partyId },
    });
  }
}

const DIRECTIVES = [LeaderboardsPageComponent];

@NgModule({
  imports: [CommonModule, UIModule, RouterModule, TrackByModule],
  declarations: [
    ...DIRECTIVES,
    RankingComponent,
    RankingPositionComponent,
    PartySelectorComponent,
  ],
  exports: DIRECTIVES,
})
export class LeaderboardsPageModule {}
