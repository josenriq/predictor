import { CommonModule } from '@angular/common';
import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-team-banner',
  template: `<img src="/assets/teams/{{ teamId }}.svg" />`,
  styles: [
    `
      img {
        width: 3rem;
        height: 3rem * 3 / 4;
        border-radius: 4px;
        box-shadow: rgb(99 99 99 / 20%) 0px 2px 8px 0px;
      }
    `,
  ],
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
