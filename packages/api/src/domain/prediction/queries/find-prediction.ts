import { Guard, Maybe } from '@predictor/core';
import { Id, Query } from '@predictor/domain';
import { Prediction, PredictionStorage } from '../prediction';

export type FindPredictionInput = {
  matchId: Id;
  userId: Id;
};

export class FindPrediction
  implements Query<FindPredictionInput, Maybe<Prediction>>
{
  constructor(private readonly storage: PredictionStorage) {
    Guard.require(this.storage, 'storage');
  }

  execute(input: FindPredictionInput): Promise<Maybe<Prediction>> {
    Guard.require(input, 'input');
    return this.storage.findByUserAndMatch(input.userId, input.matchId);
  }
}
