import { NgModule, Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  selector: 'app-privacy-page',
  template: `
    <h1>Data Deletion Requests</h1>
    <p class="tw-text-muted tw-text-sm">Last updated on 11/1/2023</p>

    <p
      >Should you wish to have your data deleted from qatar2022.gg, please
      contact us at qatar2022predictor@gmail.com. We'll gladly and promptly take
      care of your request.</p
    >
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataDeletionPageComponent {}

const routes: Routes = [
  {
    path: '',
    component: DataDeletionPageComponent,
    data: {
      title: 'Data Deletion Requests',
    },
  },
];

@NgModule({
  declarations: [DataDeletionPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataDeletionModule {}
