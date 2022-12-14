import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  HostBinding,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  Match,
  MatchStage,
  MatchStatus,
  PredictionOutcome,
  Team,
} from 'app/graphql';
import { CommonModule } from '@angular/common';
import { UIModule } from 'app/ui';
import { delay, Maybe } from 'app/core';
import {
  BehaviorSubject,
  debounceTime,
  filter,
  skip,
  Subject,
  takeUntil,
} from 'rxjs';

export type Score = {
  home: number;
  away: number;
};

@Component({
  selector: 'app-team-name',
  template: `
    <div class="tw-font-bold tw-truncate">
      <span class="tw-inline sm:tw-hidden tw-uppercase">{{ team.id }}</span>
      <span class="tw-hidden sm:tw-inline">{{ team.name }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamNameComponent {
  @HostBinding('class') classs = 'tw-block';
  @Input() team!: Team;
}

@Component({
  selector: 'app-score-number',
  template: `
    <div
      #number
      class="tw-block tw-text-3xl tw-whitespace-nowrap tw-text-center tw-w-8 number"
    >
      {{ !value && value !== 0 ? '?' : value }}
    </div>
  `,
  styles: [
    `
      @keyframes jump {
        0% {
          transform: scale(1);
        }
        20% {
          transform: scale(2);
        }
        100% {
          transform: scale(1);
        }
      }
      .animated {
        animation: jump 300ms ease;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreNumberComponent implements OnChanges {
  @Input() value?: number;

  @ViewChild('number') numberEl!: ElementRef<HTMLElement>;

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['value'].isFirstChange()) return;
    this.animate();
  }

  private animate(): void {
    if (!this.numberEl) return;

    this.numberEl.nativeElement.classList.remove('animated');
    requestAnimationFrame(() =>
      this.numberEl.nativeElement.classList.add('animated'),
    );
  }
}

@Component({
  selector: 'app-score',
  template: `
    <div
      class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-gap-x-2 tw-font-bold"
    >
      <app-score-number [value]="home"></app-score-number>
      <div>:</div>
      <app-score-number [value]="away"></app-score-number>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreComponent {
  @Input() home?: number;
  @Input() away?: number;
}

@Component({
  selector: 'app-team-banner-button',
  template: `
    <button
      type="button"
      class="pushable"
      (touchstart)="pressDown($event)"
      (touchend)="pressUp()"
      (touchmove)="pressCancel()"
      (touchcancel)="pressCancel()"
      (mousedown)="pressDown($event)"
      (mouseup)="pressUp()"
      (mouseleave)="pressCancel()"
    >
      <!-- Background images for the bottom edge -->
      <div class="edge-container">
        <app-team-banner class="edge" [teamId]="teamId"></app-team-banner>
        <app-team-banner
          class="edge tw-translate-y-[-2px]"
          [teamId]="teamId"
        ></app-team-banner>
        <app-team-banner
          class="edge tw-translate-y-[-3px]"
          [teamId]="teamId"
        ></app-team-banner>
        <app-team-banner
          class="edge tw-translate-y-[-4px]"
          [teamId]="teamId"
        ></app-team-banner>
        <app-team-banner
          class="edge tw-translate-y-[-5px]"
          [teamId]="teamId"
        ></app-team-banner>
        <app-team-banner
          class="edge tw-translate-y-[-6px]"
          [teamId]="teamId"
        ></app-team-banner>
        <app-team-banner
          class="edge tw-translate-y-[-7px]"
          [teamId]="teamId"
        ></app-team-banner>
        <span class="edge mask"></span>
      </div>
      <app-team-banner class="front" [teamId]="teamId"></app-team-banner>
    </button>
  `,
  // Adapted from: https://www.joshwcomeau.com/animation/3d-button/
  styles: [
    `
      :host {
        user-select: none;
      }
      button * {
        pointer-events: none;
      }
      .pushable {
        position: relative;
        top: 4px;
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
        outline-offset: 4px;
        border-radius: 12px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        transition: filter 250ms,
          box-shadow 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
      }
      .edge-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 12px;
        overflow: hidden;
      }
      .edge {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .mask {
        background: rgba(0, 0, 0, 0.3);
      }
      .front {
        display: block;
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        will-change: transform;
        transform: translateY(-4px);
        transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
      }
      .pushable:hover {
        filter: brightness(110%);
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
      }
      .pushable:hover .front {
        transform: translateY(-6px);
        transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
      }
      .pushable:active .front {
        transform: translateY(-2px);
        transition: transform 34ms;
      }
      .pushable:focus:not(:focus-visible) {
        outline: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamBannerButtonComponent {
  @Input() teamId!: string;

  @Output() increment = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  private holdTimeout: any;

  pressDown(event: MouseEvent | TouchEvent): void {
    if ('button' in event && event.button !== 0) return; // only main click

    event.preventDefault();
    this.holdTimeout = setTimeout(() => {
      this.reset.emit();
      this.holdTimeout = null;
    }, 600);
  }

  pressUp(): void {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
      this.increment.emit();
    }
  }

  pressCancel(): void {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    }
  }
}

type TutorialStep = 'press' | 'hold' | 'finished';

@Component({
  selector: 'app-tutorial',
  template: `
    <div
      class="tw-text-center tw-uppercase tw-text-sm tw-font-semibold tw-transition-colors tw-duration-600"
      [class.tw-animate-bounce]="step === 'press' || step === 'hold'"
      [class.tw-text-green-500]="step === 'press'"
      [class.tw-text-blue-500]="step === 'hold'"
      [class.tw-text-brand]="step === 'finished'"
      [class.explode]="step === 'finished'"
    >
      <ng-container *ngIf="step === 'press'">
        Press the flags to predict the score
      </ng-container>
      <ng-container *ngIf="step === 'hold'">
        Press and hold to reset
      </ng-container>
      <ng-container *ngIf="step === 'finished'"> You got it! </ng-container>
    </div>
  `,
  styles: [
    `
      @keyframes explode {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }
      .explode {
        animation: explode 1s 1s ease;
        animation-fill-mode: both;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TutorialComponent implements OnChanges {
  @Input() step: TutorialStep = 'press';
  @Output() finished = new EventEmitter<void>();

  async ngOnChanges(): Promise<void> {
    if (this.step === 'finished') {
      await delay(2000);
      this.finished.emit();
    }
  }
}

@Pipe({
  name: 'pointsMessage',
})
export class PointsMessagePipe implements PipeTransform {
  transform(points: Maybe<number> = 0): string {
    if (points === 0) return `You didn't win any points`;
    return `You scored ${points ?? 0} ${points === 1 ? 'point' : 'points'}!`;
  }
}

@Component({
  selector: 'app-match-status',
  template: `
    <div
      class="tw-text-center"
      [class.tw-animate-pulse]="match.status === MatchStatus.Ongoing"
    >
      <div
        *ngIf="match.status === MatchStatus.Ongoing"
        class="tw-text-red-500 tw-font-bold"
        >{{ match.time ?? 'Ongoing' }}</div
      >
      <div *ngIf="match.status === MatchStatus.Cancelled" class="tw-text-muted"
        >Cancelled</div
      >
      <div *ngIf="match.status === MatchStatus.Postponed" class="tw-text-muted"
        >Postponed</div
      >
      <div
        *ngIf="
          match.status === MatchStatus.Finished && !match.prediction?.outcome
        "
        class="tw-text-muted"
        >Finished</div
      >
      <div
        *ngIf="
          match.status === MatchStatus.Finished && !!match.prediction?.outcome
        "
        class="tw-font-semibold"
        [class.tw-text-muted]="
          match.prediction?.outcome === PredictionOutcome.Incorrect
        "
        [class.tw-text-blue-500]="
          match.prediction?.outcome === PredictionOutcome.Correct
        "
        [class.tw-text-green-500]="
          match.prediction?.outcome === PredictionOutcome.Exact
        "
        >{{ match.prediction?.points | pointsMessage }}</div
      >
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchStatusComponent {
  @HostBinding('class') class = 'tw-block';

  @Input() match!: Match;

  MatchStatus = MatchStatus;
  PredictionOutcome = PredictionOutcome;
}

@Component({
  selector: 'app-match',
  template: `
    <div class="tw-flex tw-flex-col tw-flex-nowrap">
      <div class="tw-text-center tw-text-xs tw-text-muted tw-mb-2">
        {{ match.startsAt | date: 'EEE MMM d, h:mm a' }}
      </div>

      <app-tutorial
        *ngIf="tutorial"
        [step]="tutorialStep"
        (finished)="finishTutorial()"
      ></app-tutorial>

      <div
        class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-mt-2 tw-gap-x-3"
      >
        <app-team-name
          class="tw-flex-1 tw-text-right"
          [team]="match.homeTeam"
        ></app-team-name>

        <app-team-banner-button
          *ngIf="match.isOpenForPredictions"
          [teamId]="match.homeTeam.id"
          (increment)="incrementScore('home')"
          (reset)="resetScore('home')"
        ></app-team-banner-button>

        <app-team-banner
          *ngIf="!match.isOpenForPredictions"
          [teamId]="match.homeTeam.id"
        ></app-team-banner>

        <div class="tw-flex tw-flex-col tw-flex-nowrap">
          <ng-container
            *ngIf="!!match.score && match.status !== MatchStatus.Unstarted"
          >
            <app-score
              [class.tw-animate-pulse]="match.status === MatchStatus.Ongoing"
              [class.tw-text-red-500]="match.status === MatchStatus.Ongoing"
              [home]="match.score?.home"
              [away]="match.score?.away"
              title="Actual result"
            ></app-score>
            <div class="tw-w-full tw-h-px tw-bg-gray-300"></div>
          </ng-container>
          <app-score
            [class.tw-text-brand]="!match.prediction?.outcome"
            [class.tw-text-muted]="
              match.prediction?.outcome === PredictionOutcome.Incorrect
            "
            [class.tw-text-blue-500]="
              match.prediction?.outcome === PredictionOutcome.Correct
            "
            [class.tw-text-green-500]="
              match.prediction?.outcome === PredictionOutcome.Exact
            "
            [home]="(prediction$ | async)?.home"
            [away]="(prediction$ | async)?.away"
            title="Your guess"
          ></app-score>
        </div>

        <app-team-banner-button
          *ngIf="match.isOpenForPredictions"
          [teamId]="match.awayTeam.id"
          (increment)="incrementScore('away')"
          (reset)="resetScore('away')"
        ></app-team-banner-button>

        <app-team-banner
          *ngIf="!match.isOpenForPredictions"
          [teamId]="match.awayTeam.id"
        ></app-team-banner>

        <app-team-name
          class="tw-flex-1"
          [team]="match.awayTeam"
        ></app-team-name>
      </div>

      <app-match-status
        *ngIf="match.status !== MatchStatus.Unstarted"
        class="tw-mt-2"
        [match]="match"
      ></app-match-status>

      <div class="tw-text-center tw-text-xs tw-text-muted tw-mt-4">
        <span class="tw-font-semibold">
          <ng-container *ngIf="match.stage === MatchStage.Group && match.group"
            >Group {{ match.group }}</ng-container
          >
          <ng-container *ngIf="match.stage === MatchStage.RoundOf16"
            >Round of 16</ng-container
          >
          <ng-container *ngIf="match.stage === MatchStage.QuaterFinal"
            >Quarter Final</ng-container
          >
          <ng-container *ngIf="match.stage === MatchStage.SemiFinal"
            >Semi Final</ng-container
          >
          <ng-container *ngIf="match.stage === MatchStage.ThirdPlace"
            >Third Place</ng-container
          >
          <ng-container *ngIf="match.stage === MatchStage.Final"
            >FINAL</ng-container
          ></span
        >
        ??? {{ match.stadium }}
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'tw-block';

  @Input() match!: Match;
  MatchStatus = MatchStatus;
  MatchStage = MatchStage;

  prediction$ = new BehaviorSubject<Partial<Score>>({});
  @Output() predictionChanged = new EventEmitter<Score>();

  @Input() tutorial = false;
  tutorialStep: TutorialStep = 'press';

  @Output() finishedTutorial = new EventEmitter<void>();

  PredictionOutcome = PredictionOutcome;

  destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.prediction$.next(this.match?.prediction?.score ?? {});

    this.prediction$
      .pipe(
        skip(1),
        filter(
          ({ home, away }) =>
            typeof home !== 'undefined' && typeof away !== 'undefined',
        ),
        debounceTime(600),
        takeUntil(this.destroy$),
      )
      .subscribe(score => this.predictionChanged.emit(score as Score));
  }

  incrementScore(side: keyof Score): void {
    const pred = this.prediction$.getValue();

    this.prediction$.next({
      ...pred,
      [side]: ((pred[side] ?? -1) + 1) % 16,
    });

    if (this.tutorialStep === 'press') {
      this.tutorialStep = 'hold';
    }
  }

  resetScore(side: keyof Score): void {
    const pred = this.prediction$.getValue();
    this.prediction$.next({
      ...pred,
      [side]: 0,
    });

    if (this.tutorialStep === 'hold') {
      this.tutorialStep = 'finished';
    }
  }

  finishTutorial(): void {
    this.tutorial = false;
    this.finishedTutorial.emit();
  }
}

const DIRECTIVES = [MatchComponent];

@NgModule({
  imports: [CommonModule, UIModule],
  declarations: [
    ...DIRECTIVES,
    TeamNameComponent,
    TeamBannerButtonComponent,
    ScoreComponent,
    ScoreNumberComponent,
    TutorialComponent,
    MatchStatusComponent,
    PointsMessagePipe,
  ],
  exports: DIRECTIVES,
})
export class MatchModule {}
