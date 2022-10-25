import { CommonModule } from '@angular/common';
import {
  NgModule,
  Directive,
  Component,
  ChangeDetectionStrategy,
  Input,
  HostBinding,
} from '@angular/core';
import { Maybe } from 'app/core';
import { SessionUser } from 'app/graphql';
import { Session } from 'app/session';
import { UIModule } from 'app/ui';

@Directive({ selector: '[app-side-bar-slot]' })
export class SideBarSlot {}

@Component({
  selector: 'app-brand',
  template: `<img src="/assets/logo.svg" class="tw-h-10 tw-mx-auto" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandComponent {}

@Component({
  selector: 'app-top-bar',
  template: `
    <nav>
      <div class="tw-container tw-p-4 tw-mx-auto">
        <app-brand></app-brand>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {}

@Component({
  selector: 'app-login-card',
  template: `
    <app-card [translucent]="true">
      <app-card-section>
        <div class="tw-text-center tw-text-xl tw-py-4">Hey there 👋🏻</div>
        <a [href]="loginUrl" app-button variant="primary" size="lg"
          >Sign in to play</a
        >
      </app-card-section>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginCardComponent {
  @Input() loginUrl!: string;
}

@Component({
  selector: 'app-user-card',
  styles: [
    `
      .menu-open {
        transform: translateY(0) !important;
      }
    `,
  ],
  template: `
    <app-card
      class="tw-pointer-events-auto tw-mt-12 tw-translate-y-[195px] tw-transition-transform tw-duration-300 sm:tw-translate-y-0"
      [translucent]="true"
      [class.menu-open]="isMenuOpen"
      (click)="toggleMenu()"
    >
      <app-avatar
        size="lg"
        [name]="user?.name"
        [picture]="user?.picture"
        class="tw-block tw-relative -tw-top-12 -tw-mb-16"
      ></app-avatar>

      <!-- Name and points -->
      <app-card-section class="tw-pb-4">
        <div class="tw-text-center tw-text-xl">{{ user?.name }}</div>
        <div
          class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-justify-center tw-text-brand"
        >
          <!-- spacer -->
          <div class="tw-px-2"></div>
          <span class="tw-font-bold tw-text-5xl">{{ user?.points ?? 0 }}</span>
          <span class="tw-font-bold tw-text-sm tw-pl-0.5">pts</span>
        </div>
      </app-card-section>

      <!-- Menu -->
      <div class="sm:tw-rounded-b-lg sm:tw-overflow-hidden">
        <app-menu>
          <a href="/" app-menu-item>Matches</a>
          <a href="/activity" app-menu-item>
            Activity
            <app-badge>170</app-badge>
          </a>
          <a href="/rankings" app-menu-item>Leaderboards</a>
          <a [href]="logoutUrl" app-menu-item
            ><span class="tw-text-brand">Sign out</span></a
          >
        </app-menu>
      </div>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  @HostBinding('class') class = 'tw-block tw-pointer-events-none';

  @Input() user!: Maybe<SessionUser>;
  @Input() logoutUrl!: string;

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}

@Component({
  selector: 'app-main-layout',
  template: `
    <div class="tw-container tw-mx-auto">
      <div
        class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 lg:tw-grid-cols-4 tw-gap-x-8 tw-items-start"
      >
        <aside class="sm:tw-sticky sm:tw-top-20">
          <app-login-card
            *ngIf="!(session.user$ | async)"
            [loginUrl]="session.loginUrl"
            class="tw-fixed tw-z-20 tw-left-0 tw-right-0 tw-bottom-0 sm:tw-static"
          ></app-login-card>
          <app-user-card
            *ngIf="!!(session.user$ | async)"
            [user]="session.user$ | async"
            [logoutUrl]="session.logoutUrl"
            class="tw-fixed tw-z-20 tw-left-0 tw-right-0 tw-bottom-0 sm:tw-static"
          ></app-user-card>
        </aside>

        <section class="sm:tw-col-span-2 tw-px-4 sm:tw-px-0 tw-pb-[50vh]">
          <app-top-bar></app-top-bar>
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

const DIRECTIVES = [SideBarSlot, MainLayoutComponent];

@NgModule({
  imports: [CommonModule, UIModule],
  declarations: [
    ...DIRECTIVES,
    BrandComponent,
    TopBarComponent,
    LoginCardComponent,
    UserCardComponent,
  ],
  exports: DIRECTIVES,
})
export class MainLayoutModule {}
