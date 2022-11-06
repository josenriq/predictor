import {
  Inject,
  Injectable,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import confetti, { Options as ConfettiOptions } from 'canvas-confetti';

export function isElement(obj: unknown): obj is Element {
  return !!obj && typeof (obj as any)['getBoundingClientRect'] === 'function';
}

@Injectable({ providedIn: 'root' })
export class Confetti {
  constructor(@Inject('Window') private readonly window: Window) {}

  public throw(options: Partial<ConfettiOptions> = {}): void {
    let { origin } = options;
    if (isElement(origin)) {
      try {
        const rect = origin.getBoundingClientRect();
        const center = {
          x: rect.x + Math.round(rect.width / 2),
          y: rect.y + Math.round(rect.height / 2),
        };
        origin = {
          x: center.x / this.window.innerWidth,
          y: center.y / this.window.innerHeight,
        };
      } catch {
        origin = void 0;
      }
    }

    confetti({
      zIndex: 9999,
      ...options,
      origin,
    });
  }
}

@NgModule()
export class ConfettiModule {
  static forRoot(): ModuleWithProviders<ConfettiModule> {
    return {
      ngModule: ConfettiModule,
      providers: [{ provide: 'Window', useValue: window }],
    };
  }
}
