import { CommonModule } from '@angular/common';
import { NgModule, Directive, HostBinding } from '@angular/core';

@Directive({
  selector: 'a[app-link]',
})
export class LinkDirective {
  @HostBinding('class') class = 'tw-text-brand tw-underline';
}

const DIRECTIVES = [LinkDirective];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class LinkModule {}
