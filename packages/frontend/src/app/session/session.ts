import {
  Injectable,
  NgModule,
  ModuleWithProviders,
  OnDestroy,
  InjectionToken,
  Inject,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged, map } from 'rxjs/operators';
import { Maybe, Url } from 'app/core';
import { SessionQuery, SessionQueryResult } from './session.query';
import { SESSION_INITIALIZER } from './initializer';
import { User, WatchQueryResult } from 'app/graphql';

export type SessionOptions = { apiBaseUri: string };

export const SESSION_OPTIONS = new InjectionToken<SessionOptions>(
  'app-session-options',
);

@Injectable({ providedIn: 'root' })
export class Session implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly sessionRef: WatchQueryResult<SessionQueryResult>;
  public readonly user$: Observable<Maybe<User>>;
  public readonly isLoading$: Observable<boolean>;

  constructor(
    private readonly sessionQuery: SessionQuery,
    @Inject(SESSION_OPTIONS) private readonly options: SessionOptions,
  ) {
    this.sessionRef = this.sessionQuery.watch();

    this.isLoading$ = this.sessionRef.isLoading$;
    this.user$ = this.sessionRef.data$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      map(data => data.me),
    );
  }

  get loginUrl(): string {
    return Url.join(this.options.apiBaseUri, '/login');
  }
  get logoutUrl(): string {
    return Url.join(this.options.apiBaseUri, '/logout');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

@NgModule()
export class SessionModule {
  static forRoot(options: SessionOptions): ModuleWithProviders<SessionModule> {
    return {
      ngModule: SessionModule,
      providers: [
        {
          provide: SESSION_OPTIONS,
          useFactory: (): SessionOptions => options,
        },
        SESSION_INITIALIZER,
      ],
    };
  }
}
