import { Component, OnDestroy, OnInit } from '@angular/core';
import { Daemons } from './daemons';

@Component({
  selector: 'app-root',
  template: `
    <app-main-layout>
      <router-outlet></router-outlet>
    </app-main-layout>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private readonly daemons: Daemons) {}

  ngOnInit(): void {
    this.daemons.run();
  }

  ngOnDestroy(): void {
    this.daemons.destroy();
  }
}
