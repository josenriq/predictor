import { Guard } from '@predictor/core';
import { Id, Command } from '@predictor/domain';
import {
  MatchIsClosedForPredictions,
  MatchNotFound,
  MatchStorage,
} from '@predictor/domain/match';
import { Score } from '@predictor/domain/score';
import { Prediction, PredictionStorage } from '../prediction';

export type SavePredictionCommandInput = {
  matchId: Id;
  userId: Id;
  score: Score;
};

export class SavePrediction
  implements Command<SavePredictionCommandInput, Prediction>
{
  constructor(
    private readonly predictionStorage: PredictionStorage,
    private readonly matchStorage: MatchStorage,
  ) {
    Guard.require(this.predictionStorage, 'predictionStorage');
    Guard.require(this.matchStorage, 'matchStorage');
  }

  async execute(input: SavePredictionCommandInput): Promise<Prediction> {
    Guard.require(input, 'input');

    const match = await this.matchStorage.find(input.matchId);
    if (!match) {
      throw new MatchNotFound(input.matchId);
    }
    if (!match.isOpenForPredictions) {
      throw new MatchIsClosedForPredictions(input.matchId);
    }

    return await this.predictionStorage.save(input);
  }
}
