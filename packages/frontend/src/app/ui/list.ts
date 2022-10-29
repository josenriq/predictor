import { CommonModule } from '@angular/common';
import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  HostBinding,
  Input,
  OnChanges,
} from '@angular/core';

@Component({
  selector: 'app-list-item',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemComponent implements OnChanges {
  @HostBinding('class') class = this.buildClass();
  @Input() highlighted = false;

  ngOnChanges(): void {
    this.class = this.buildClass();
  }

  private buildClass(): string {
    const classes = [
      'tw-block tw-px-4 tw-py-3 odd:tw-bg-white even:tw-bg-gray-50 first:tw-rounded-t last:tw-rounded-b',
    ];
    if (this.highlighted) {
      classes.push('tw-border-brand tw-border-dashed tw-border-2');
    }
    return classes.join(' ');
  }
}

@Component({
  selector: 'app-list',
  template: `
    <div class="tw-flex tw-flex-col tw-flex-nowrap">
      <ng-content select="app-list-item"></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {}

const DIRECTIVES = [ListComponent, ListItemComponent];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class ListModule {}
