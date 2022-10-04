import { CommonModule } from '@angular/common';
import {
  NgModule,
  Directive,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Session } from 'app/session';
import { UIModule } from 'app/ui';

@Directive({ selector: '[app-top-bar-slot]' })
export class TopBarSlot {}

@Directive({ selector: '[app-side-bar-slot]' })
export class SideBarSlot {}

@Component({
  selector: 'app-brand',
  template: `<img src="/assets/logo.svg" class="tw-h-10" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandComponent {}

@Component({
  selector: 'app-top-bar',
  template: `
    <nav class="tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-z-10">
      <div
        class="tw-absolute tw-inset-0 tw-bg-white tw-bg-opacity-70 fader"
      ></div>
      <div class="tw-relative tw-container tw-mx-auto">
        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4">
          <div
            class="tw-p-4 tw-flex tw-flex-row tw-items-center tw-justify-center"
          >
            <app-brand></app-brand>
          </div>
          <div class="md:tw-col-span-2 tw-p-4"><ng-content></ng-content></div>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .fader {
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {}

@Component({
  selector: 'app-main-layout',
  template: `
    <app-top-bar
      ><ng-content select="[app-top-bar-slot]"></ng-content
    ></app-top-bar>
    <div class="tw-container tw-mx-auto tw-pt-20">
      <div
        class="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4 tw-items-start"
      >
        <aside class="md:tw-sticky md:tw-top-20 tw-p-4">
          {{ session.isLoading$ | async | json }}

          <ng-container *ngIf="!(session.user$ | async)">
            <a [href]="session.loginUrl" app-button variant="primary"
              >Sign in!</a
            >
          </ng-container>

          <ng-container *ngIf="!!(session.user$ | async)">
            <p>Welcome {{ session.user$ | async | json }}</p>
            <a [href]="session.logoutUrl" app-button>Sign out!</a>
          </ng-container>
        </aside>
        <section class="md:tw-col-span-2 tw-p-4">
          <ng-content></ng-content>
        </section>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  constructor(public readonly session: Session) {}
}

const DIRECTIVES = [SideBarSlot, TopBarSlot, MainLayoutComponent];

@NgModule({
  imports: [CommonModule, UIModule],
  declarations: [...DIRECTIVES, BrandComponent, TopBarComponent],
  exports: DIRECTIVES,
})
export class MainLayoutModule {}
