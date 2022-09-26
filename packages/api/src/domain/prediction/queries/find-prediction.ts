import { Guard, Maybe } from '@predictor/core';
import { Id, Query } from '@predictor/domain';
import { Prediction, PredictionStorage } from '../prediction';

export type FindPredictionQueryInput = {
  matchId: Id;
  userId: Id;
};

export class FindPrediction
  implements Query<FindPredictionQueryInput, Maybe<Prediction>>
{
  constructor(private readonly storage: PredictionStorage) {
    Guard.require(this.storage, 'storage');
  }

  execute(input: FindPredictionQueryInput): Promise<Maybe<Prediction>> {
    Guard.require(input, 'input');
    return this.storage.find(input);
  }
}
