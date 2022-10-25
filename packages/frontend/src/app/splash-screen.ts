import {
  Inject,
  Injectable,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SplashScreen {
  constructor(@Inject('Window') private readonly window: Window) {}

  hide(): void {
    // @ts-ignore
    const destroy = this.window['__predictor_splash_screen__'];
    if (!destroy) return;
    destroy();
  }
}

@NgModule()
export class SplashScreenModule {
  static forRoot(): ModuleWithProviders<SplashScreenModule> {
    return {
      ngModule: SplashScreenModule,
      providers: [{ provide: 'Window', useValue: window }],
    };
  }
}
