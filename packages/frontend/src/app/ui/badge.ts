import { CommonModule } from '@angular/common';
import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';

@Component({
  selector: 'app-badge',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  @HostBinding('class') class =
    'tw-block tw-bg-brand tw-text-white tw-text-xs tw-font-bold tw-py-1 tw-px-2 tw-rounded-xl';
}

const DIRECTIVES = [BadgeComponent];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class BadgeModule {}
