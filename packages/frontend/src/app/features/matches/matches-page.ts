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

@Component({
  selector: 'app-matches-page',
  template: `
    <p *ngIf="isLoading$ | async">Loading...</p>

    <ng-container *ngIf="!(isLoading$ | async)">
      <div *ngFor="let match of matches$ | async" style="padding-bottom: 20px">
        <p>Group {{ match.group }}, {{ match.startsAt | date: 'medium' }}</p>
        <p
          ><b>{{ match.homeTeam.name }}</b> vs
          <b>{{ match.awayTeam.name }}</b></p
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
  imports: [CommonModule],
  declarations: [...DIRECTIVES],
  exports: DIRECTIVES,
})
export class MatchesPageModule {}
