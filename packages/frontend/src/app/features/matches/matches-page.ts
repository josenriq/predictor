import {
  NgModule,
  Component,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatchesQuery } from './matches.query';
import { Match } from 'app/graphql';
import { CommonModule } from '@angular/common';
import { UIModule } from 'app/ui';
import { LayoutModule } from 'app/layout';
import { TrackByIdModule } from 'ng-track-by';

@Component({
  selector: 'app-matches-page',
  template: `
    <app-main-layout>
      <section>
        <!-- <p *ngIf="isLoading$ | async">Loading...</p> -->

        <ng-container *ngIf="!(isLoading$ | async)">
          <div
            *ngFor="let match of matches$ | async"
            trackById
            class="tw-pb-12"
          >
            <div class="tw-text-center tw-text-sm tw-text-gray-600">{{
              match.startsAt | date: 'MMM d, h:mm a'
            }}</div>
            <div
              class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-py-3"
            >
              <div class="tw-flex-1 tw-font-bold tw-text-right tw-pr-3">{{
                match.homeTeam.name
              }}</div>
              <app-team-banner [teamId]="match.homeTeam.id"></app-team-banner>
              <div class="tw-px-3 tw-text-2xl"> 3 - 1 </div>
              <app-team-banner [teamId]="match.awayTeam.id"></app-team-banner>
              <div class="tw-flex-1 tw-font-bold tw-pl-3">{{
                match.awayTeam.name
              }}</div>
            </div>
            <p class="tw-text-center tw-text-xs tw-text-gray-600"
              >Group {{ match.group }} • {{ match.stadium }}</p
            >
          </div>

          <div
            *ngIf="hasMore$ | async"
            class="tw-p-4 tw-flex tw-items-center tw-justify-center"
          >
            <button type="button" app-button (click)="loadMore()"
              >Load More</button
            >
          </div>
        </ng-container>
      </section>
    </app-main-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchesPageComponent implements OnInit {
  matches$!: Observable<Match[]>;
  hasMore$!: Observable<boolean>;
  isLoading$!: Observable<boolean>;

  private readonly PAGE_SIZE = 8;
  private readonly limit$ = new BehaviorSubject(this.PAGE_SIZE);

  constructor(private readonly matchesQuery: MatchesQuery) {}

  ngOnInit(): void {
    const { data$, isLoading$ } = this.matchesQuery.watch();

    this.matches$ = combineLatest([
      this.limit$,
      data$.pipe(map(data => data.matches)),
    ]).pipe(map(([limit, matches]) => matches.slice(0, limit)));

    this.hasMore$ = combineLatest([
      this.limit$,
      data$.pipe(map(data => data.matches)),
    ]).pipe(map(([limit, matches]) => limit < matches.length));

    this.isLoading$ = isLoading$;
  }

  loadMore(): void {
    const limit = this.limit$.getValue();
    this.limit$.next(limit + this.PAGE_SIZE);
  }
}

const DIRECTIVES = [MatchesPageComponent];

@NgModule({
  imports: [CommonModule, UIModule, LayoutModule, TrackByIdModule],
  declarations: [...DIRECTIVES],
  exports: DIRECTIVES,
})
export class MatchesPageModule {}
