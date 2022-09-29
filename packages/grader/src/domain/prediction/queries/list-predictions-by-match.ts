import { Guard } from '@predictor/core';
import { Id, PageOptions, Query } from '@predictor/domain';
import { Prediction, PredictionStorage } from '../prediction';

export type ListPredictionsByMatchInput = PageOptions & {
  matchId: Id;
};

export class ListPredictionsByMatch
  implements Query<ListPredictionsByMatchInput, Prediction[]>
{
  constructor(private readonly storage: PredictionStorage) {
    Guard.require(this.storage, 'storage');
  }

  execute(input: ListPredictionsByMatchInput): Promise<Prediction[]> {
    Guard.require(input, 'input');
    return this.storage.listByMatch(input);
  }
}
