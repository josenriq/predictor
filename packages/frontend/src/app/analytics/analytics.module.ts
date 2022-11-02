import {
  NgModule,
  ModuleWithProviders,
  Injector,
  Provider,
} from '@angular/core';
import {
  ANALYTICS_TRACKERS,
  AnalyticsTracker,
  ConsoleTracker,
} from './analytics';
import {
  GOOGLE_ANALYTICS_OPTIONS,
  GoogleAnalyticsOptions,
  GoogleAnalyticsTracker,
} from './google-analytics';

export type AnalyticsOptions = {
  google?: GoogleAnalyticsOptions;
  debug?: boolean;
};

@NgModule()
export class AnalyticsModule {
  static forRoot(
    options: AnalyticsOptions = {},
  ): ModuleWithProviders<AnalyticsModule> {
    const useConsole = options.debug;
    const useGoogle = !!options.google;

    return {
      ngModule: AnalyticsModule,
      providers: [
        useGoogle && {
          provide: GOOGLE_ANALYTICS_OPTIONS,
          // @ts-ignore
          useFactory: (): GoogleAnalyticsOptions => options.google,
        },
        {
          provide: ANALYTICS_TRACKERS,
          useFactory: (injector: Injector): Array<AnalyticsTracker> =>
            [
              useConsole && injector.get(ConsoleTracker),
              useGoogle && injector.get(GoogleAnalyticsTracker),
            ].filter(Boolean) as Array<AnalyticsTracker>,
          deps: [Injector],
        },
      ].filter(Boolean) as Array<Provider>,
    };
  }
}
