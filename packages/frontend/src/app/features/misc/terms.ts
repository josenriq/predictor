import { NgModule, Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

@Component({
  selector: 'app-terms-page',
  template: `Terms of Use goes here`,
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
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TermsModule {}
