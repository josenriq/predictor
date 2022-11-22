import { CommonModule } from '@angular/common';
import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  Input,
  HostBinding,
  EventEmitter,
  Output,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { Maybe } from 'app/core';
import { SessionUser } from 'app/graphql';
import { Session } from 'app/session';
import { UIModule } from 'app/ui';

@Component({
  selector: 'app-brand',
  template: `<div
    class="tw-h-10 tw-text-2xl tw-font-fancy tw-font-bold tw-text-brand tw-text-center tw-mx-auto"
    >Qatar 2022 Predictor</div
  >`,
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
        <div class="tw-text-center tw-pb-3 tw-italic"
          >Guess the scores of the upcoming World Cup and play against your
          friends!</div
        >
        <a
          href="javascript:void(0)"
          app-button
          variant="primary"
          size="lg"
          (click)="login.emit()"
          >Sign in to play</a
        >
      </app-card-section>
      <!-- Menu -->
      <div class="sm:tw-rounded-b-lg sm:tw-overflow-hidden">
        <app-menu>
          <a routerLink="/" app-menu-item>Matches</a>
          <a routerLink="/leaderboards" app-menu-item>Leaderboards</a>
          <a routerLink="/about" app-menu-item>About</a>
        </app-menu>
      </div>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginCardComponent {
  @Output() login = new EventEmitter<void>();
}

@Component({
  selector: 'app-arrow-indicator',
  template: `
    <div class=" tw-flex tw-items-center tw-justify-center tw-pb-4">
      <div
        class="tw-h-1 tw-w-6 tw-rounded-sm tw-bg-gray-200 tw-transition-transform tw-duration-500 tw-translate-x-px"
        [class.tw-rotate-12]="direction === 'down'"
        [class.-tw-rotate-12]="direction === 'up'"
      ></div>
      <div
        class="tw-h-1 tw-w-6 tw-rounded-sm tw-bg-gray-200 tw-transition-transform tw-duration-500 -tw-translate-x-px"
        [class.-tw-rotate-12]="direction === 'down'"
        [class.tw-rotate-12]="direction === 'up'"
      ></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrowIndicatorComponent {
  @Input() direction: 'up' | 'down' = 'up';
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
      <app-card-section class="sm:tw-mb-2">
        <div class="tw-text-center tw-text-xl tw-font-semibold">{{
          user?.name
        }}</div>
        <app-points
          class="tw-text-brand tw-font-bold"
          [points]="user?.points ?? 0"
          size="lg"
        ></app-points>
      </app-card-section>

      <!-- Arrow indicator (Mobile) -->
      <app-arrow-indicator
        class="sm:tw-hidden"
        [direction]="isMenuOpen ? 'down' : 'up'"
      ></app-arrow-indicator>

      <!-- Menu -->
      <div class="sm:tw-rounded-b-lg sm:tw-overflow-hidden">
        <app-menu>
          <a routerLink="/" app-menu-item>Matches</a>
          <!-- <a routerLink="/activity" app-menu-item>
            Activity
            <app-badge>170</app-badge>
          </a> -->
          <a routerLink="/leaderboards" app-menu-item>Leaderboards</a>
          <a routerLink="/about" app-menu-item>About</a>
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

  @Input() user!: Maybe<
    Pick<SessionUser, 'id' | 'name' | 'picture' | 'points'>
  >;
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
        <aside class="sm:tw-sticky sm:tw-top-20 sm:tw-mt-20">
          <app-login-card
            *ngIf="!(session.user$ | async)"
            class="tw-fixed tw-z-20 tw-left-0 tw-right-0 tw-bottom-0 sm:tw-static"
            (login)="session.login()"
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
          <div class="tw-pt-4 animate-fadeInUp">
            <ng-content></ng-content>
          </div>
        </section>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  constructor(public readonly session: Session) {}
}

const DIRECTIVES = [MainLayoutComponent];

@NgModule({
  imports: [CommonModule, RouterModule, UIModule],
  declarations: [
    ...DIRECTIVES,
    BrandComponent,
    TopBarComponent,
    LoginCardComponent,
    UserCardComponent,
    ArrowIndicatorComponent,
  ],
  exports: DIRECTIVES,
})
export class MainLayoutModule {}
