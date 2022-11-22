import { NgModule } from '@angular/core';
import { AvatarModule } from './avatar';
import { BadgeModule } from './badge';
import { ButtonModule } from './button';
import { CardModule } from './card';
import { CollapseModule } from './collapse';
import { CountdownModule } from './countdown';
import { LinkModule } from './link';
import { ListModule } from './list';
import { MenuModule } from './menu';
import { PointsModule } from './points';
import { SideScrollerModule } from './side-scroller';
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
    SideScrollerModule,
    CountdownModule,
    ListModule,
    PointsModule,
    CollapseModule,
  ],
})
export class UIModule {}
