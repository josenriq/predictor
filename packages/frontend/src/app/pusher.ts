import {
  Inject,
  Injectable,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { Observable } from 'rxjs';
import Pusher from 'pusher-js';

export type PusherConfig = {
  key: string;
  cluster?: string;
};

export const PUSHER_CONFIG = new InjectionToken<PusherConfig>(
  'app-pusher-config',
);

export type PusherEvent = {
  name: string;
  data: any;
};

@Injectable({ providedIn: 'root' })
export class PusherService {
  private observables: Record<string, Observable<PusherEvent>> = {};

  private readonly client: Pusher;

  constructor(@Inject(PUSHER_CONFIG) config: PusherConfig) {
    this.client = new Pusher(config.key, {
      cluster: config.cluster ?? 'mt1',
    });
  }

  subscribe(channelName: string, eventName: string): Observable<PusherEvent> {
    const key = channelName + '_' + eventName;
    if (!this.observables[key]) {
      this.observables[key] = new Observable(observer => {
        const channel =
          this.client.channel(channelName) ||
          this.client.subscribe(channelName);
        channel.bind(eventName, (data: any) =>
          observer.next({ name: eventName, data }),
        );
      });
    }
    return this.observables[key];
  }

  unsubscribe(channelName: string): void {
    this.client.unsubscribe(channelName);

    Object.keys(this.observables).forEach(key => {
      if (key.startsWith(channelName + '_')) {
        delete this.observables[key];
      }
    });
  }

  unsubscribeFromAll(): void {
    Object.keys(this.observables).forEach(key => {
      const channelName = key.split('_')[0];
      this.client.unsubscribe(channelName);
    });
    this.observables = {};
  }
}

@NgModule()
export class PusherModule {
  static forRoot(config: PusherConfig): ModuleWithProviders<PusherModule> {
    return {
      ngModule: PusherModule,
      providers: [{ provide: PUSHER_CONFIG, useFactory: () => config }],
    };
  }
}
