import { CommonModule } from '@angular/common';
import { NgModule, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-side-scroller',
  template: `
    <div class="tw-overflow-hidden">
      <div
        class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-gap-x-2 tw-overflow-x-auto tw-pb-8 -tw-mb-8"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .tw-overflow-x-auto {
        -webkit-overflow-scrolling: touch;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideScrollerComponent {}

const DIRECTIVES = [SideScrollerComponent];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class SideScrollerModule {}
