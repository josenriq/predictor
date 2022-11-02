import { Injectable } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { Analytics } from 'app/analytics';
import { Daemon } from './daemon';

function isNavigationEnd(e: Event): e is NavigationEnd {
  return e instanceof NavigationEnd;
}

@Injectable()
export class TrackPagesDaemon extends Daemon {
  private readonly destroy$ = new Subject<void>();
  constructor(
    private readonly router: Router,
    private readonly analytics: Analytics,
  ) {
    super();
  }

  run(): void {
    this.router.events
      .pipe(
        filter(isNavigationEnd),
        map(event => event.urlAfterRedirects),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.analytics.page());
  }

  stop(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
