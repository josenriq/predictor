import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';
import { Maybe } from 'app/core';

export type AnalyticsTraits = Record<string, unknown> & {
  name: string;
  email?: Maybe<string>;
  picture?: Maybe<string>;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
export abstract class AnalyticsTracker {
  identify(id: string, traits: AnalyticsTraits): void {}
  update(id: string, traits: Partial<AnalyticsTraits>): void {}
  track(category: string, event: string, payload?: Record<string, any>): void {}
  page(): void {}
  reset(): void {}
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export const ANALYTICS_TRACKERS = new InjectionToken<AnalyticsTracker>(
  'mn-analytics-trackers',
);

function safe(operation: () => void): void {
  try {
    operation();
  } catch (e) {
    console.error(e);
  }
}

@Injectable({ providedIn: 'root' })
export class ConsoleTracker extends AnalyticsTracker {
  override identify(id: string, traits: AnalyticsTraits): void {
    console.group('analytics: identify');
    console.log('id:', id);
    console.log('traits:', traits);
    console.groupEnd();
  }

  override update(id: string, traits: Partial<AnalyticsTraits>): void {
    console.group('analytics: update');
    console.log('id:', id);
    console.log('traits:', traits);
    console.groupEnd();
  }

  override track(
    category: string,
    event: string,
    payload: Record<string, any>,
  ): void {
    console.group('analytics: track');
    console.log('category:', category);
    console.log('event:', event);
    console.log('payload:', payload);
    console.groupEnd();
  }

  override page(): void {
    console.group('analytics: page');
    console.groupEnd();
  }

  override reset(): void {
    console.group('analytics: reset');
    console.groupEnd();
  }
}

@Injectable({ providedIn: 'root' })
export class Analytics extends AnalyticsTracker {
  constructor(
    @Optional()
    @Inject(ANALYTICS_TRACKERS)
    private readonly trackers: Array<AnalyticsTracker> = [],
  ) {
    super();
  }

  override identify(id: string, traits: AnalyticsTraits): void {
    safe(() => this.trackers.forEach(tracker => tracker.identify(id, traits)));
  }

  override update(id: string, traits: Partial<AnalyticsTraits>): void {
    safe(() => this.trackers.forEach(tracker => tracker.update(id, traits)));
  }

  override track(
    category: string,
    event: string,
    payload?: Record<string, any>,
  ): void {
    safe(() =>
      this.trackers.forEach(tracker => tracker.track(category, event, payload)),
    );
  }

  override page(): void {
    safe(() => this.trackers.forEach(tracker => tracker.page()));
  }

  override reset(): void {
    safe(() => this.trackers.forEach(tracker => tracker.reset()));
  }
}
