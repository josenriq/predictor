import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatchesPageModule, MatchesPageComponent } from './matches-page';

const routes: Routes = [
  {
    path: '',
    // canActivate: [SessionRouterGuardService],
    component: MatchesPageComponent,
    data: {
      title: 'Matches',
    },
  },
];

@NgModule({
  imports: [MatchesPageModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MatchesModule {}
