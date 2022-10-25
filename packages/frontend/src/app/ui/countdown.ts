import { CommonModule } from '@angular/common';
import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  Input,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CoreModule } from 'app/core';
import intervalToDuration from 'date-fns/intervalToDuration';

@Component({
  selector: 'app-countdown-slot',
  template: `
    <div class="tw-text-center tw-flex tw-flex-col tw-gap-y-1">
      <div
        class="tw-p-2 tw-bg-brand tw-text-white tw-font-semibold tw-text-xl"
        [class.tw-rounded-l-md]="first"
        [class.tw-rounded-r-md]="last"
        >{{ value | pad }}</div
      >
      <div class="tw-text-xs tw-uppercase tw-text-muted">{{ label }}</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownSlotComponent {
  @Input() value = 0;
  @Input() label!: string;

  @Input() first = false;
  @Input() last = false;
}

@Component({
  selector: 'app-countdown',
  template: `
    <div class="tw-flex tw-flex-row tw-flex-nowrap tw-gap-x-px">
      <app-countdown-slot
        class="tw-w-1/2"
        [value]="days"
        label="Days"
        [first]="true"
      ></app-countdown-slot>
      <app-countdown-slot
        class="tw-w-1/2"
        [value]="hours"
        label="Hr"
      ></app-countdown-slot>
      <app-countdown-slot
        class="tw-w-1/2"
        [value]="minutes"
        label="Min"
      ></app-countdown-slot>
      <app-countdown-slot
        class="tw-w-1/2"
        [value]="seconds"
        label="Sec"
        [last]="true"
      ></app-countdown-slot>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownComponent implements AfterViewInit, OnDestroy {
  @Input() date = new Date(Date.UTC(2022, 10, 20, 16)); // opening game!

  private countdownInterval?: NodeJS.Timer;

  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;

  constructor(private readonly detector: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.countdownInterval = setInterval(() => {
      const duration = intervalToDuration({
        start: new Date(),
        end: this.date,
      });

      this.days = duration.days ?? 0;
      this.hours = duration.hours ?? 0;
      this.minutes = duration.minutes ?? 0;
      this.seconds = duration.seconds ?? 0;

      this.detector.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}

const DIRECTIVES = [CountdownComponent];

@NgModule({
  imports: [CommonModule, CoreModule],
  declarations: [...DIRECTIVES, CountdownSlotComponent],
  exports: DIRECTIVES,
})
export class CountdownModule {}
