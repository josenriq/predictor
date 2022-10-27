import { NgModule, Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from 'app/layout';

@Component({
  selector: 'app-privacy-page',
  template: ` <app-main-layout> Privacy Policy goes here </app-main-layout> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPageComponent {}

const routes: Routes = [
  {
    path: '',
    component: PrivacyPageComponent,
    data: {
      title: 'Privacy Policy',
    },
  },
];

@NgModule({
  declarations: [PrivacyPageComponent],
  imports: [CommonModule, LayoutModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivacyModule {}
