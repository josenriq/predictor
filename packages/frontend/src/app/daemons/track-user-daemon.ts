import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { skipWhile, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Session } from 'app/session';
import { Analytics } from 'app/analytics';
import { Daemon } from './daemon';

@Injectable()
export class TrackUserDaemon extends Daemon {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly session: Session,
    private readonly analytics: Analytics,
  ) {
    super();
  }

  run(): void {
    this.session.user$
      .pipe(
        distinctUntilChanged((prev, next) => prev?.id === next?.id),
        skipWhile(user => user == null),
        takeUntil(this.destroy$),
      )
      .subscribe(user => {
        if (!user) {
          this.analytics.reset();
          return;
        }
        const { id, name, picture } = user;
        this.analytics.identify(id, { name, picture });
      });
  }

  stop(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
