import { Injectable } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { SplashScreen } from 'app/splash-screen';
import { Daemon } from './daemon';

@Injectable()
export class HideSplashScreenDaemon extends Daemon {
  constructor(
    private readonly router: Router,
    private readonly splash: SplashScreen,
  ) {
    super();
  }

  run(): void {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        take(1),
      )
      .subscribe(() => this.splash.hide());
  }

  stop(): void {}
}
