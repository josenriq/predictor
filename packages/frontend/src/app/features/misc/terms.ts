import { NgModule, Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from 'app/layout';

@Component({
  selector: 'app-terms-page',
  template: ` <app-main-layout> Terms of Use goes here </app-main-layout> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsPageComponent {}

const routes: Routes = [
  {
    path: '',
    component: TermsPageComponent,
    data: {
      title: 'Terms of Use',
    },
  },
];

@NgModule({
  declarations: [TermsPageComponent],
  imports: [CommonModule, LayoutModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TermsModule {}
