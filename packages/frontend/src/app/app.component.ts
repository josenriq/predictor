import { Component, OnDestroy, OnInit } from '@angular/core';
import { Daemons } from './daemons';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet> `,
  styles: [],
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
