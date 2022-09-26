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
      <div
        *ngFor="let match of matches$ | async"
        style="padding-bottom: 20px; width: 500px; max-width: 90vw"
      >
        <p style="text-align: center">{{ match.startsAt | date: 'medium' }}</p>
        <div style="display: flex; flex-flow: row nowrap; align-items: center">
          <div style="flex: 1 1 0; text-align: right"
            ><b>{{ match.homeTeam.name }}</b></div
          >
          <div style="width: 1rem"></div>
          <app-team-banner [teamId]="match.homeTeam.id"></app-team-banner>
          <div style="width: 1rem"></div>
          <div>vs</div>
          <div style="width: 1rem"></div>
          <app-team-banner [teamId]="match.awayTeam.id"></app-team-banner>
          <div style="width: 1rem"></div>
          <div style="flex: 1 1 0"
            ><b>{{ match.awayTeam.name }}</b></div
          >
        </div>
        <p style="text-align: center"
          ><small>Group {{ match.group }}<br />{{ match.stadium }}</small></p
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
