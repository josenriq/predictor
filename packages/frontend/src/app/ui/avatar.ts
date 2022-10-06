import { CommonModule } from '@angular/common';
import {
  NgModule,
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CoreModule, Maybe } from 'app/core';
import { Size } from './size';

@Component({
  selector: 'app-avatar',
  template: `
    <div
      class="tw-relative tw-rounded-full tw-overflow-hidden tw-mx-auto tw-border-white tw-text-white"
      [class.tw-w-24]="size === 'lg'"
      [class.tw-h-24]="size === 'lg'"
      [class.tw-w-12]="size === 'md'"
      [class.tw-h-12]="size === 'md'"
      [class.tw-w-8]="size === 'sm'"
      [class.tw-h-8]="size === 'sm'"
      [class.tw-border-4]="size === 'lg'"
      [class.tw-border-2]="size === 'md' || size === 'sm'"
      [class.tw-bg-brand]="!picture"
      [class.tw-bg-white]="!!picture"
    >
      <img *ngIf="picture" [src]="picture" class="tw-w-100" />
      <div
        *ngIf="!picture && name"
        class="tw-absolute tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2"
        [class.tw-text-5xl]="size === 'lg'"
        [class.tw-text-2xl]="size === 'md'"
      >
        {{ name ? (name | initials) : '' }}
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  @Input() size: Size = 'md';
  @Input() name: Maybe<string>;
  @Input() picture: Maybe<string>;
}

const DIRECTIVES = [AvatarComponent];

@NgModule({
  imports: [CommonModule, CoreModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class AvatarModule {}
