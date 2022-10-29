import {
  NgModule,
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { RankingsQuery } from './rankings.query';
import { CommonModule } from '@angular/common';
import { UIModule } from 'app/ui';
import { LayoutModule } from 'app/layout';
import { TrackByModule } from 'ng-track-by';
import { Session } from 'app/session';
import { TournamentEntry, WatchQueryResult } from 'app/graphql';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

type Ranking = TournamentEntry & {
  position: number;
};

@Component({
  selector: 'app-ranking-position',
  template: `
    <div
      class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-justify-center tw-w-10"
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
    <div class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-gap-x-4">
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
  selector: 'app-leaderboards-page',
  template: `
    <app-main-layout>
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
    </app-main-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardsPageComponent implements OnInit, OnDestroy {
  query!: WatchQueryResult<unknown>;
  rankings$!: Observable<Ranking[]>;
  hasMore$!: Observable<boolean>;
  isLoading$!: Observable<boolean>;

  private readonly PAGE_SIZE = 20;
  private pageNumber = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    public readonly session: Session,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly rankingsQuery: RankingsQuery,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  private loadLeaderboard(): void {
    const query = this.rankingsQuery.watch({
      input: { pageSize: this.PAGE_SIZE, pageNumber: this.pageNumber },
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

  loadMore(): void {
    this.pageNumber++;
    this.query.fetchMore({
      input: { pageSize: this.PAGE_SIZE, pageNumber: this.pageNumber },
    });
  }
}

const DIRECTIVES = [LeaderboardsPageComponent];

@NgModule({
  imports: [CommonModule, UIModule, LayoutModule, RouterModule, TrackByModule],
  declarations: [...DIRECTIVES, RankingComponent, RankingPositionComponent],
  exports: DIRECTIVES,
})
export class LeaderboardsPageModule {}
