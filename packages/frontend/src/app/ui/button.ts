import { CommonModule } from '@angular/common';
import {
  NgModule,
  Directive,
  HostBinding,
  Input,
  OnChanges,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary';

@Directive({
  selector: 'button[app-button], a[app-button]',
})
export class ButtonDirective implements OnChanges {
  @HostBinding('class') class = 'btn btn-secondary';

  @Input() variant: ButtonVariant = 'secondary';

  ngOnChanges(): void {
    if (this.variant === 'primary') {
      this.class = 'btn btn-primary';
    } else {
      this.class = 'btn btn-secondary';
    }
  }
}

const DIRECTIVES = [ButtonDirective];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class ButtonModule {}
