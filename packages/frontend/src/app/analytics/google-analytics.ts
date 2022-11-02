import {
  Injectable,
  InjectionToken,
  Inject,
  NgModule,
  ModuleWithProviders,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Script } from 'app/core';
import { AnalyticsTracker } from './analytics';

const GA = 'ga';

type GoogleAnalyticsCommand = 'create' | 'send' | 'set' | 'remove';

export type GoogleAnalyticsHit = 'pageview' | 'event' | 'social' | 'timing';

function ga(cmd: GoogleAnalyticsCommand, ...args: Array<any>): void {
  // @ts-ignore
  const google = window[GA];
  if (!google) return;
  google(cmd, ...args);
}

function ensure(): void {
  // @ts-ignore
  window['GoogleAnalyticsObject'] = GA;
  // @ts-ignore
  (window[GA] =
    // @ts-ignore
    window[GA] ||
    function (): void {
      // @ts-ignore
      (window[GA].q = window[GA].q || []).push(arguments); // eslint-disable-line prefer-rest-params
    }),
    // @ts-ignore
    (window[GA].l = 1 * new Date());
}

export type GoogleAnalyticsOptions = { id: string };

export const GOOGLE_ANALYTICS_OPTIONS =
  new InjectionToken<GoogleAnalyticsOptions>('mn-google-analytics-options');

@Injectable({ providedIn: 'root' })
export class GoogleAnalytics {
  private readonly id: string;
  constructor(
    @Inject(GOOGLE_ANALYTICS_OPTIONS) options: GoogleAnalyticsOptions,
    script: Script,
  ) {
    this.id = options.id;
    if (!!this.id) {
      ensure();
      script.load(`https://www.google-analytics.com/analytics.js`);
    }
  }

  create(): void {
    ga('create', this.id, 'auto');
  }

  send(hit: GoogleAnalyticsHit, ...args: Array<any>): void {
    ga('send', hit, ...args);
  }

  set(values: Record<string, unknown>): void;
  set(field: string, value: unknown): void;
  set(...args: Array<any>): void {
    ga('set', ...args);
  }

  remove(): void {
    ga('remove');
  }
}

@Injectable({ providedIn: 'root' })
export class GoogleAnalyticsTracker extends AnalyticsTracker {
  constructor(
    private readonly ga: GoogleAnalytics,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {
    super();
    this.ga.create();
  }

  override identify(id: string): void {
    this.ga.set('userId', id);
  }

  override track(
    category: string,
    event: string,
    payload?: Record<string, any>,
  ): void {
    const label = !!payload ? JSON.stringify(payload) : void 0;
    this.ga.send('event', category, event, label);
  }

  override page(): void {
    // Remove emails from urls
    const url = this.document.location.href.replace(
      /([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})/gi,
      '',
    );
    this.ga.set('location', url);
    this.ga.send('pageview');
  }

  override reset(): void {
    this.ga.remove();
    this.ga.create();
  }
}

@NgModule()
export class GoogleAnalyticsModule {
  static forRoot(
    options: GoogleAnalyticsOptions,
  ): ModuleWithProviders<GoogleAnalyticsModule> {
    return {
      ngModule: GoogleAnalyticsModule,
      providers: [
        {
          provide: GOOGLE_ANALYTICS_OPTIONS,
          useFactory: (): GoogleAnalyticsOptions => options,
        },
      ],
    };
  }
}
