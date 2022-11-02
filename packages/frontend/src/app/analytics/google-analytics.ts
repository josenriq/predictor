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

type GoogleAnalyticsCommand = 'js' | 'config' | 'set' | 'event';

export type GoogleAnalyticsEvent = 'page_view' | 'login' | string;

function gtag(cmd: GoogleAnalyticsCommand, ...args: Array<any>): void {
  // @ts-ignore
  const dataLayer = window['dataLayer'] ?? [];
  dataLayer.push(cmd, ...args);
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
      script.load(`https://www.googletagmanager.com/gtag/js?id=${this.id}`);
    }
  }

  create(): void {
    gtag('js', new Date());
    gtag('config', this.id);
  }

  send(event: GoogleAnalyticsEvent, ...args: Array<any>): void {
    gtag('event', event, ...args);
  }

  set(values: Record<string, unknown>): void;
  set(field: string, value: unknown): void;
  set(...args: Array<any>): void {
    gtag('set', ...args);
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

  override identify(userId: string): void {
    this.ga.send('login', { userId });
  }

  override track(
    category: string,
    event: string,
    payload?: Record<string, any>,
  ): void {
    const label = !!payload ? JSON.stringify(payload) : void 0;
    this.ga.send('event', `${category} - ${event}`, { category, event, label });
  }

  override page(): void {
    // Remove emails from urls
    const url = this.document.location.href.replace(
      /([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})/gi,
      '',
    );
    this.ga.send('page_view', { page_location: url });
  }

  override reset(): void {
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
