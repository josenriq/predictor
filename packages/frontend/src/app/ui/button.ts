import { CommonModule } from '@angular/common';
import {
  NgModule,
  Directive,
  HostBinding,
  Input,
  OnChanges,
} from '@angular/core';
import { Size } from './size';

export type ButtonVariant = 'primary' | 'secondary';

@Directive({
  selector: 'button[app-button], a[app-button]',
})
export class ButtonDirective implements OnChanges {
  @HostBinding('class') class = 'btn btn-secondary';

  @Input() variant: ButtonVariant = 'secondary';
  @Input() size: Size = 'md';
  @Input() pill = false;
  @Input() selected = false;

  ngOnChanges(): void {
    const classes = ['btn', `btn-${this.variant}`];
    if (this.size !== 'md') {
      classes.push(`btn-${this.size}`);
    }
    if (this.pill) {
      classes.push('btn-pill');
    }
    if (this.selected) {
      classes.push('btn-selected');
    }
    this.class = classes.join(' ');
  }
}

const DIRECTIVES = [ButtonDirective];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class ButtonModule {}
