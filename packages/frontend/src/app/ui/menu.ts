import { CommonModule } from '@angular/common';
import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';

@Component({
  selector: 'app-menu-item, a[app-menu-item], button[app-menu-item]',
  template: `
    <div class="tw-flex-grow"><ng-content></ng-content></div>
    <div><ng-content select="app-badge"></ng-content></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent {
  @HostBinding('class') class =
    'tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-px-4 tw-py-3 tw-bg-gray-50 hover:tw-bg-gray-100 tw-border-t first:tw-border-t-0';
}

@Component({
  selector: 'app-menu',
  template: `
    <div class="tw-flex tw-flex-col tw-flex-nowrap">
      <ng-content select="app-menu-item, [app-menu-item]"></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {}

const DIRECTIVES = [MenuComponent, MenuItemComponent];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class MenuModule {}
