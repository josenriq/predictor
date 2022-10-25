import {
  Injectable,
  InjectionToken,
  Optional,
  Inject,
  NgModule,
  ModuleWithProviders,
  Type,
  Injector,
} from '@angular/core';

export abstract class Daemon {
  abstract run(): void;
  abstract stop(): void;
}

export const DAEMONS = new InjectionToken<Daemon>('app-daemons');

@Injectable({ providedIn: 'root' })
export class Daemons {
  constructor(
    @Optional()
    @Inject(DAEMONS)
    private readonly daemons: Array<Daemon> = [],
  ) {}

  run(): void {
    this.daemons.forEach(daemon => daemon.run());
  }

  destroy(): void {
    this.daemons.forEach(daemon => daemon.stop());
  }
}

export type DaemonsOptions = {
  daemons: Array<Type<Daemon>>;
};

@NgModule()
export class DaemonsModule {
  static forRoot(options: DaemonsOptions): ModuleWithProviders<DaemonsModule> {
    const daemons = options?.daemons ?? [];
    return {
      ngModule: DaemonsModule,
      providers: [
        {
          provide: DAEMONS,
          useFactory: (injector: Injector): Array<Daemon> =>
            daemons.map(daemon => injector.get(daemon)).filter(Boolean),
          deps: [Injector],
        },
        ...daemons,
      ].filter(Boolean),
    };
  }
}
