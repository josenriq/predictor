import { NgModule } from '@angular/core';
import { ClipboardModule } from './clipboard';
import { InitialsModule } from './initials';
import { PadModule } from './pad';

@NgModule({
  exports: [ClipboardModule, InitialsModule, PadModule],
})
export class CoreModule {}
