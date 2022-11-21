import { CommonModule } from '@angular/common';
import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Size } from './size';

@Component({
  selector: 'app-points',
  template: `
    <div
      class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-justify-center"
    >
      <!-- spacer -->
      <div class="tw-px-2"></div>
      <span
        [class.tw-text-xl]="size === 'sm'"
        [class.tw-text-2xl]="size === 'md'"
        [class.tw-text-5xl]="size === 'lg'"
        >{{ points }}</span
      >
      <span class="tw-text-sm tw-pl-0.5">{{
        points === 1 ? 'pt&nbsp;' : 'pts'
      }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointsComponent {
  @Input() points = 0;
  @Input() size: Size = 'md';
}

const DIRECTIVES = [PointsComponent];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class PointsModule {}
