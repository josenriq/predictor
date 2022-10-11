import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  HostBinding,
  Input,
} from '@angular/core';
import { Match } from 'app/graphql';
import { CommonModule } from '@angular/common';
import { UIModule } from 'app/ui';

@Component({
  selector: 'app-match',
  template: `
    <app-card>
      <app-card-section>
        <div class="tw-text-center tw-text-xs tw-text-muted">{{
          match.startsAt | date: 'MMM d, h:mm a'
        }}</div>
        <div class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-py-3">
          <div class="tw-flex-1 tw-font-bold tw-text-right tw-pr-3 tw-truncate">
            <span class="tw-inline sm:tw-hidden tw-uppercase">{{
              match.homeTeam.id
            }}</span>
            <span class="tw-hidden sm:tw-inline">{{
              match.homeTeam.name
            }}</span>
          </div>
          <app-team-banner [teamId]="match.homeTeam.id"></app-team-banner>
          <div class="tw-px-3 tw-text-2xl tw-whitespace-nowrap"> 3 - 1 </div>
          <app-team-banner [teamId]="match.awayTeam.id"></app-team-banner>
          <div class="tw-flex-1 tw-font-bold tw-pl-3 tw-truncate">
            <span class="tw-inline sm:tw-hidden tw-uppercase">{{
              match.awayTeam.id
            }}</span>
            <span class="tw-hidden sm:tw-inline">{{
              match.awayTeam.name
            }}</span>
          </div>
        </div>
        <div class="tw-text-center tw-text-xs tw-text-muted"
          >Group {{ match.group }} • {{ match.stadium }}</div
        >
      </app-card-section>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchComponent {
  @HostBinding('class') class = 'tw-block';

  @Input() match!: Match;
}

const DIRECTIVES = [MatchComponent];

@NgModule({
  imports: [CommonModule, UIModule],
  declarations: [...DIRECTIVES],
  exports: DIRECTIVES,
})
export class MatchModule {}
