import {
  NgModule,
  Component,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { MeQuery, watchMeQuery } from './me.query';
import { User, WatchQuery } from 'app/graphql';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-matches-page',
  template: `
    <p *ngIf="isLoading$ | async">Loading...</p>
    <p *ngIf="!(isLoading$ | async)"
      >Hello <b>{{ (me$ | async)?.name }}</b
      >!</p
    >
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchesPageComponent implements OnInit {
  meQuery!: WatchQuery<MeQuery>;
  me$!: Observable<User>;
  isLoading$!: Observable<boolean>;

  constructor(private readonly apollo: Apollo) {}

  ngOnInit(): void {
    this.meQuery = watchMeQuery(this.apollo);
    this.me$ = this.meQuery.data$.pipe(map(data => data.me));
    this.isLoading$ = this.meQuery.isLoading$;
  }
}

const DIRECTIVES = [MatchesPageComponent];

@NgModule({
  imports: [CommonModule],
  declarations: [...DIRECTIVES],
  exports: DIRECTIVES,
})
export class MatchesPageModule {}
