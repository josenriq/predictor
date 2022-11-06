import { CommonModule } from '@angular/common';
import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  HostBinding,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-card-section',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSectionComponent {
  @HostBinding('class') class = 'tw-block tw-p-4';
}

export type CardVariant = 'white' | 'light' | 'brand' | 'striped';

@Component({
  selector: 'app-card',
  template: `
    <div
      class="tw-absolute tw-inset-0 tw-rounded-lg"
      [class.tw-bg-white]="variant === 'white'"
      [class.tw-bg-light]="variant === 'light'"
      [class.tw-bg-brand]="variant === 'brand'"
      [class.striped]="variant === 'striped'"
      [class.tw-bg-opacity-80]="translucent"
      [class.tw-backdrop-blur-sm]="translucent"
    ></div>
    <div class="tw-relative">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .striped {
        background: repeating-linear-gradient(
          -45deg,
          var(--tw-bg-white),
          var(--tw-bg-white),
          10px,
          var(--tw-bg-light),
          10px,
          var(--tw-bg-light) 20px
        );
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @HostBinding('class') class = 'tw-block tw-relative tw-rounded-lg tw-shadow';

  @Input() variant: CardVariant = 'white';
  @Input() translucent = false;
}

const DIRECTIVES = [CardComponent, CardSectionComponent];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class CardModule {}
