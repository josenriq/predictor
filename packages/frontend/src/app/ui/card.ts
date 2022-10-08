import { CommonModule } from '@angular/common';
import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';

@Component({
  selector: 'app-card-section',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSectionComponent {
  @HostBinding('class') class = 'tw-block tw-p-4';
}

@Component({
  selector: 'app-card',
  template: `
    <div
      class="tw-absolute tw-inset-0 tw-rounded-xl tw-bg-white tw-bg-opacity-80 blurred"
    ></div>
    <div class="tw-relative">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .blurred {
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @HostBinding('class') class =
    'tw-block tw-relative tw-rounded-xl tw-shadow-lg';
}

const DIRECTIVES = [CardComponent, CardSectionComponent];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class CardModule {}
