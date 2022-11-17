import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Daemon } from '../daemon';
import { PusherService } from 'app/pusher';
import { RefetchMatchQuery } from './refetch-match.query';
import { Maybe } from 'app/core';

@Injectable()
export class RefetchMatchDaemon extends Daemon {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly pusher: PusherService,
    private readonly refetchQuery: RefetchMatchQuery,
  ) {
    super();
  }

  run(): void {
    this.pusher
      .subscribe('qatar2022', 'match-updated')
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ name, data }) => {
        const matchId = data['matchId'] as Maybe<string>;
        if (matchId) {
          this.refetchQuery.fetch({ matchId }, { fetchPolicy: 'network-only' });
        }
      });
  }

  stop(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
