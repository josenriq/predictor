import {
  NgModule,
  Component,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatchesQuery } from './matches.query';
import { Match } from 'app/graphql';
import { CommonModule } from '@angular/common';
import { UIModule } from 'app/ui';
import { LayoutModule } from 'app/layout';

@Component({
  selector: 'app-matches-page',
  template: `
    <app-main-layout>
      <section>
        <p *ngIf="isLoading$ | async">Loading...</p>

        <ng-container *ngIf="!(isLoading$ | async)">
          <div *ngFor="let match of matches$ | async" class="tw-pb-12">
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
        </ng-container>
      </section>
    </app-main-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchesPageComponent implements OnInit {
  matches$!: Observable<Match[]>;
  isLoading$!: Observable<boolean>;

  constructor(private readonly matchesQuery: MatchesQuery) {}

  ngOnInit(): void {
    const { data$, isLoading$ } = this.matchesQuery.watch();
    this.matches$ = data$.pipe(map(data => data.matches));
    this.isLoading$ = isLoading$;
  }
}

const DIRECTIVES = [MatchesPageComponent];

@NgModule({
  imports: [CommonModule, UIModule, LayoutModule],
  declarations: [...DIRECTIVES],
  exports: DIRECTIVES,
})
export class MatchesPageModule {}
