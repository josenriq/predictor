import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="tw-container tw-mx-auto tw-py-20">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [],
})
export class AppComponent {}
