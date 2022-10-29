import { NgModule, Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  selector: 'app-privacy-page',
  template: `Privacy Policy goes here`,
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
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivacyModule {}
