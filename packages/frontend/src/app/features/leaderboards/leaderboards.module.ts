import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  CreatePartyPageComponent,
  CreatePartyPageModule,
} from './create-party-page';
import {
  LeaderboardsPageModule,
  LeaderboardsPageComponent,
  LeaderboardsRedirectorComponent,
} from './leaderboards-page';

const routes: Routes = [
  {
    path: 'new',
    pathMatch: 'full',
    component: CreatePartyPageComponent,
    data: {
      title: 'Create Party',
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
    CreatePartyPageModule,
    LeaderboardsPageModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class LeaderboardsModule {}
