import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  CreateLeaderboardPageComponent,
  CreateLeaderboardPageModule,
} from './create-leaderboard-page';
import {
  LeaderboardsPageModule,
  LeaderboardsPageComponent,
  LeaderboardsRedirectorComponent,
} from './leaderboards-page';

const routes: Routes = [
  {
    path: 'new',
    pathMatch: 'full',
    component: CreateLeaderboardPageComponent,
    data: {
      title: 'Create Leaderboard',
    },
  },
  {
    path: ':partyId',
    component: LeaderboardsPageComponent,
    data: {
      title: 'Leaderboards',
    },
  },
  {
    path: '',
    component: LeaderboardsRedirectorComponent,
    data: {
      title: 'Leaderboards',
    },
  },
];

@NgModule({
  imports: [
    CreateLeaderboardPageModule,
    LeaderboardsPageModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class LeaderboardsModule {}
