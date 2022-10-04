import { NgModule } from '@angular/core';
import { ClipboardModule } from './clipboard';
import { InitialsModule } from './initials';

@NgModule({
  exports: [ClipboardModule, InitialsModule],
})
export class CoreModule {}
