import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  LeaderboardsPageModule,
  LeaderboardsPageComponent,
} from './leaderboards-page';

const routes: Routes = [
  {
    path: ':partyId',
    component: LeaderboardsPageComponent,
    data: {
      title: 'Leaderboards',
    },
  },
  {
    path: '',
    component: LeaderboardsPageComponent,
    data: {
      title: 'Leaderboards',
    },
  },
];

@NgModule({
  imports: [LeaderboardsPageModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaderboardsModule {}
