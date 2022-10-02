import {
  NgModule,
  Component,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { MatchesQuery, watchMatchesQuery } from './matches.query';
import { Match, WatchQuery } from 'app/graphql';
import { CommonModule } from '@angular/common';
import { UIModule } from 'app/ui';

@Component({
  selector: 'app-matches-page',
  template: `
    <p *ngIf="isLoading$ | async">Loading...</p>

    <ng-container *ngIf="!(isLoading$ | async)">
      <div *ngFor="let match of matches$ | async" class="tw-pb-12">
        <div class="tw-text-center tw-text-sm tw-text-gray-600">{{
          match.startsAt | date: 'medium'
        }}</div>
        <div class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-py-3">
          <div class="tw-flex-1 tw-font-bold tw-text-right tw-pr-3">{{
            match.homeTeam.name
          }}</div>
          <app-team-banner [teamId]="match.homeTeam.id"></app-team-banner>
          <div class="tw-px-3">vs</div>
          <app-team-banner [teamId]="match.awayTeam.id"></app-team-banner>
          <div class="tw-flex-1 tw-font-bold tw-pl-3">{{
            match.awayTeam.name
          }}</div>
        </div>
        <p class="tw-text-center tw-text-xs tw-text-gray-600"
          >Group {{ match.group }}<br />{{ match.stadium }}</p
        >
      </div>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchesPageComponent implements OnInit {
  matchesQuery!: WatchQuery<MatchesQuery>;
  matches$!: Observable<Match[]>;
  isLoading$!: Observable<boolean>;

  constructor(private readonly apollo: Apollo) {}

  ngOnInit(): void {
    this.matchesQuery = watchMatchesQuery(this.apollo);
    this.matches$ = this.matchesQuery.data$.pipe(map(data => data.matches));
    this.isLoading$ = this.matchesQuery.isLoading$;
  }
}

const DIRECTIVES = [MatchesPageComponent];

@NgModule({
  imports: [CommonModule, UIModule],
  declarations: [...DIRECTIVES],
  exports: DIRECTIVES,
})
export class MatchesPageModule {}
