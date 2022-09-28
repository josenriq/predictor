import { Guard, Maybe } from '@predictor/core';
import { Id, Query } from '@predictor/domain';
import { Prediction, PredictionStorage } from '../prediction';

export type ListPredictionsByMatchQueryInput = {
  matchId: Id;
};

export class ListPredictionsByMatch
  implements Query<ListPredictionsByMatchQueryInput, Prediction[]>
{
  constructor(private readonly storage: PredictionStorage) {
    Guard.require(this.storage, 'storage');
  }

  execute(input: ListPredictionsByMatchQueryInput): Promise<Prediction[]> {
    Guard.require(input, 'input');
    return this.storage.listByMatch(input.matchId);
  }
}
