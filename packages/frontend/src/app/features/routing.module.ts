import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
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
    path: '',
    loadChildren: async (): Promise<any> =>
      (await import('app/features/matches')).MatchesModule,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoutingModule {}
