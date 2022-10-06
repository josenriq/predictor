import { CommonModule } from '@angular/common';
import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';

@Component({
  selector: 'app-card-section',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSectionComponent {
  @HostBinding('class') class = 'tw-block tw-p-4';
}

@Component({
  selector: 'app-card',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @HostBinding('class') class =
    'tw-block tw-bg-white tw-rounded-xl tw-shadow-lg';
}

const DIRECTIVES = [CardComponent, CardSectionComponent];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class CardModule {}
