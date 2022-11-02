import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'matches',
    loadChildren: async (): Promise<any> =>
      (await import('app/features/matches')).MatchesModule,
  },
  {
    path: 'leaderboards',
    loadChildren: async (): Promise<any> =>
      (await import('app/features/leaderboards')).LeaderboardsModule,
  },
  {
    path: 'about',
    loadChildren: async (): Promise<any> =>
      (await import('app/features/misc/about')).AboutModule,
  },
  {
    path: 'terms',
    loadChildren: async (): Promise<any> =>
      (await import('app/features/misc/terms')).TermsModule,
  },
  {
    path: 'privacy',
    loadChildren: async (): Promise<any> =>
      (await import('app/features/misc/privacy')).PrivacyModule,
  },
  {
    path: 'data-deletion',
    loadChildren: async (): Promise<any> =>
      (await import('app/features/misc/data-deletion')).DataDeletionModule,
  },
  {
    path: '',
    loadChildren: async (): Promise<any> =>
      (await import('app/features/matches')).MatchesModule,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoutingModule {}
