import { NgModule } from '@angular/core';
import { AvatarModule } from './avatar';
import { BadgeModule } from './badge';
import { ButtonModule } from './button';
import { CardModule } from './card';
import { LinkModule } from './link';
import { MenuModule } from './menu';
import { TeamBannerModule } from './team-banner';

@NgModule({
  exports: [
    AvatarModule,
    ButtonModule,
    LinkModule,
    MenuModule,
    CardModule,
    BadgeModule,
    TeamBannerModule,
  ],
})
export class UIModule {}
