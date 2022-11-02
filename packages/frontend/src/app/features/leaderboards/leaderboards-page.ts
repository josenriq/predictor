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
import { combineLatest, lastValueFrom, Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { RankingsQuery } from './rankings.query';
import { CommonModule } from '@angular/common';
import { UIModule } from 'app/ui';
import { TrackByModule } from 'ng-track-by';
import { Session } from 'app/session';
import { Party, TournamentEntry, WatchQueryResult } from 'app/graphql';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PartiesQuery } from './parties.query';
import { Maybe } from 'app/core';
import { PartyQuery } from './party.query';

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
        class="select-lg sm:tw-text-center"
        (change)="select(partySelect.value)"
      >
        <option [selected]="!selectedPartyId" [value]="globalParty"
          >🌎 Global Leaderboard</option
        >
        <option *ngIf="parties.length > 0" disabled>───────────</option>
        <option
          *ngFor="let party of parties"
          [value]="party.id"
          [selected]="selectedPartyId === party.id"
          >{{ party.name }}</option
        >
        <option disabled>───────────</option>
        <option>Create new leaderboard…</option>
      </select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartySelectorComponent {
  @Input() selectedPartyId: Maybe<string>;
  @Input() parties: Party[] = [];

  @Output() changed = new EventEmitter<Maybe<string>>();

  public readonly globalParty = 'GLOBAL';

  select(partyId: Maybe<string>): void {
    this.changed.emit(partyId === this.globalParty ? void 0 : partyId);
  }
}

@Component({
  selector: 'app-leaderboards-page',
  template: `
    <section class="tw-flex tw-flex-col tw-flex-nowrap">
      <app-party-selector
        class="sticky-block tw-py-4 -tw-mt-4"
        [parties]="(parties$ | async) ?? []"
        [selectedPartyId]="(selectedParty$ | async)?.id"
        (changed)="changeParty($event)"
      ></app-party-selector>

      <!-- {{ isMemberOfParty$ | async | json }} -->

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
  selectedParty$!: Observable<Maybe<Party>>;
  isMemberOfParty$!: Observable<boolean>;

  private readonly PAGE_SIZE = 20;
  private pageNumber = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    public readonly session: Session,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly rankingsQuery: RankingsQuery,
    private readonly partiesQuery: PartiesQuery,
    private readonly partyQuery: PartyQuery,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.loadParties();

    this.selectedParty$
      .pipe(takeUntil(this.destroy$))
      .subscribe(party => this.loadLeaderboard(party?.id));
  }

  private loadParties(): void {
    const partiesQuery = this.partiesQuery.watch();
    const userParties$ = partiesQuery.data$.pipe(
      map(data => data.me?.parties ?? []),
    );

    const selectedPartyId$: Observable<Maybe<string>> = this.route.params.pipe(
      map(params => params['partyId']),
    );

    this.selectedParty$ = combineLatest([selectedPartyId$, userParties$]).pipe(
      switchMap(([partyId, userParties]) => {
        if (!partyId) return of(void 0);

        const existingParty = userParties.find(p => p.id === partyId);
        if (existingParty) return of(existingParty);

        const query = this.partyQuery.watch({ partyId });
        return query.data$.pipe(map(data => data.party));
      }),
    );

    this.parties$ = combineLatest([userParties$, this.selectedParty$]).pipe(
      map(([parties, selectedParty]) => {
        if (!selectedParty) return parties;
        const included = parties.some(p => p.id === selectedParty?.id);
        return included ? parties : [...parties, selectedParty];
      }),
    );

    this.isMemberOfParty$ = combineLatest([
      userParties$,
      this.selectedParty$,
    ]).pipe(
      map(([parties, selectedParty]) => {
        if (!selectedParty) return false;
        return parties.some(p => p.id === selectedParty?.id);
      }),
    );
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
    const party = await lastValueFrom(this.selectedParty$);
    this.pageNumber++;

    this.query.fetchMore({
      input: {
        pageSize: this.PAGE_SIZE,
        pageNumber: this.pageNumber,
        partyId: party?.id,
      },
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