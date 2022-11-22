import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  HostBinding,
  Input,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIModule } from 'app/ui';
import { Party, Prediction, WatchQueryResult } from 'app/graphql';
import { map, Observable } from 'rxjs';
import { PartyPredictionsQuery } from './party-predictions.query';
import { TrackByIdModule } from 'ng-track-by';

@Component({
  selector: 'app-prediction',
  template: `
    <div class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-gap-x-3">
      <div
        class="tw-flex tw-flex-row tw-items-center tw-gap-x-2 tw-flex-1 tw-truncate"
      >
        <app-avatar
          size="sm"
          [name]="prediction.user.name"
          [picture]="prediction.user.picture"
        ></app-avatar>
        <div class="tw-truncate tw-text-sm">{{ prediction.user.name }}</div>
      </div>
      <div
        class="tw-flex tw-flex-row tw-flex-nowrap tw-items-center tw-font-semibold"
      >
        <div class="tw-w-5 tw-text-center">{{ prediction.score.home }}</div>
        <div>-</div>
        <div class="tw-w-5 tw-text-center">{{ prediction.score.away }}</div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredictionComponent {
  @Input() prediction!: Prediction;
}

@Component({
  selector: 'app-party-selector',
  template: `
    <div class="select-wrapper">
      <select
        #partySelect
        class="sm:tw-text-center"
        (change)="select(partySelect.value)"
      >
        <option
          *ngFor="let party of parties"
          [value]="party.id"
          [selected]="selectedPartyId === party.id"
          >{{ party.name }}</option
        >
      </select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartySelectorComponent {
  @Input() selectedPartyId!: string;
  @Input() parties: Party[] = [];

  @Output() changed = new EventEmitter<string>();

  select(partyId: string): void {
    this.changed.emit(partyId);
  }
}

@Component({
  selector: 'app-party-predictions',
  template: `
    <div class="tw-flex tw-flex-col tw-flex-nowrap tw-gap-y-3">
      <app-party-selector
        *ngIf="parties.length > 1"
        [parties]="parties"
        [selectedPartyId]="selectedPartyId"
        (changed)="partyChanged.emit($event)"
      ></app-party-selector>

      <div
        *ngIf="(predictions$ | async)?.length === 0"
        class="tw-text-center tw-text-muted tw-text-sm"
        >No one else made a guess</div
      >

      <div
        *ngIf="(predictions$ | async)?.length ?? 0 > 0"
        class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-y-2 tw-gap-x-8"
      >
        <app-prediction
          *ngFor="let prediction of predictions$ | async"
          [prediction]="prediction"
          trackById
          class="animate-fadeIn"
        ></app-prediction>
      </div>

      <div *ngIf="hasMore$ | async" class="tw-text-center">
        <a href="javascript:void(0)" class="text-link" (click)="loadMore()"
          >More…</a
        >
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyPredictionsComponent implements OnChanges {
  @HostBinding('class') class = 'tw-block';

  @Input() matchId!: string;
  @Input() parties!: Party[];
  @Input() selectedPartyId!: string;

  @Output() partyChanged = new EventEmitter<string>();

  query!: WatchQueryResult<unknown>;
  predictions$!: Observable<Array<Prediction>>;
  hasMore$!: Observable<boolean>;

  private readonly PAGE_SIZE = 10;
  private pageNumber = 0;

  constructor(private readonly partyPredictionsQuery: PartyPredictionsQuery) {}

  ngOnChanges(): void {
    if (this.selectedPartyId) {
      this.loadPredictions(this.selectedPartyId);
    }
  }

  private loadPredictions(partyId: string): void {
    this.pageNumber = 0;

    const query = this.partyPredictionsQuery.watch({
      matchId: this.matchId,
      predictionsInput: {
        partyId,
        pageSize: this.PAGE_SIZE,
        pageNumber: this.pageNumber,
      },
    });
    this.query = query;

    this.predictions$ = query.data$.pipe(
      map(data => data.match.partyPredictions?.results ?? []),
    );

    this.hasMore$ = query.data$.pipe(
      map(data => data.match.partyPredictions?.hasMore ?? false),
    );
  }

  loadMore(): void {
    debugger;
    if (!this.selectedPartyId) return;

    this.pageNumber++;

    this.query?.fetchMore({
      matchId: this.matchId,
      predictionsInput: {
        partyId: this.selectedPartyId,
        pageSize: this.PAGE_SIZE,
        pageNumber: this.pageNumber,
      },
    });
  }
}

const DIRECTIVES = [PartyPredictionsComponent];

@NgModule({
  imports: [CommonModule, UIModule, TrackByIdModule],
  declarations: [...DIRECTIVES, PredictionComponent, PartySelectorComponent],
  exports: DIRECTIVES,
})
export class PartyPredictionsModule {}
