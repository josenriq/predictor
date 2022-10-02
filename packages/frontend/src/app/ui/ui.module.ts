import { NgModule } from '@angular/core';
import { ButtonModule } from './button';
import { TeamBannerModule } from './team-banner';

@NgModule({
  exports: [ButtonModule, TeamBannerModule],
})
export class UIModule {}
