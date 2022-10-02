import { CommonModule } from '@angular/common';
import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-team-banner',
  template: `<img
    class="tw-w-12 tw-h-9 tw-rounded tw-shadow"
    src="/assets/teams/{{ teamId }}.svg"
  />`,

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamBannerComponent {
  @Input() teamId!: string;
}

const DIRECTIVES = [TeamBannerComponent];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class TeamBannerModule {}
