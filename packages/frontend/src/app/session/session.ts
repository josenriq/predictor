import {
  Injectable,
  NgModule,
  ModuleWithProviders,
  InjectionToken,
  Inject,
} from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, take, tap } from 'rxjs/operators';
import { Maybe, Url } from 'app/core';
import { SessionQuery, SessionQueryResult } from './session.query';
import { SESSION_INITIALIZER } from './initializer';
import { SessionUser, WatchQueryResult } from 'app/graphql';

export type SessionOptions = { apiBaseUri: string };

export const SESSION_OPTIONS = new InjectionToken<SessionOptions>(
  'app-session-options',
);

@Injectable({ providedIn: 'root' })
export class Session {
  private readonly sessionRef: WatchQueryResult<SessionQueryResult>;
  public readonly user$: Observable<Maybe<SessionUser>>;
  public readonly isAuthenticated$: Observable<boolean>;
  public readonly isLoading$: Observable<boolean>;

  constructor(
    private readonly sessionQuery: SessionQuery,
    @Inject(SESSION_OPTIONS) private readonly options: SessionOptions,
  ) {
    this.sessionRef = this.sessionQuery.watch();

    this.isLoading$ = this.sessionRef.isLoading$;
    this.user$ = this.sessionRef.data$.pipe(
      distinctUntilChanged(),
      map(data => data.me),
    );
    this.isAuthenticated$ = this.user$.pipe(
      map(user => {
        console.log('User', user);
        return !!user;
      }),
    );
  }

  get loginUrl(): string {
    return Url.join(this.options.apiBaseUri, '/login');
  }
  get logoutUrl(): string {
    return Url.join(this.options.apiBaseUri, '/logout');
  }

  isAuthenticated(): Promise<boolean> {
    return new Promise(resolve =>
      this.isAuthenticated$.pipe(take(1)).subscribe(resolve),
    );
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
