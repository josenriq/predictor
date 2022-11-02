import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class Script {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  load(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      script.onload = (): void => resolve();
      script.onerror = (error): void => reject(error);
      this.document.body.appendChild(script);
    });
  }
}
