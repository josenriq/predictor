import { Guard } from '@predictor/core';
import { Id, Command } from '@predictor/domain';
import {
  MatchIsClosedForPredictions,
  MatchNotFound,
  MatchStorage,
} from '@predictor/domain/match';
import { Score } from '@predictor/domain/score';
import {
  TournamentEntry,
  TournamentEntryStorage,
} from '@predictor/domain/tournament-entry';
import { Prediction, PredictionStorage } from '../prediction';

export type SavePredictionInput = {
  matchId: Id;
  userId: Id;
  score: Score;
};

export class SavePrediction
  implements Command<SavePredictionInput, Prediction>
{
  constructor(
    private readonly predictionStorage: PredictionStorage,
    private readonly matchStorage: MatchStorage,
    private readonly entryStorage: TournamentEntryStorage,
  ) {
    Guard.require(this.predictionStorage, 'predictionStorage');
    Guard.require(this.matchStorage, 'matchStorage');
    Guard.require(this.entryStorage, 'entryStorage');
  }

  async execute(input: SavePredictionInput): Promise<Prediction> {
    Guard.require(input, 'input');
    const { userId, matchId, score } = input;

    const match = await this.matchStorage.find(matchId);
    if (!match) {
      throw new MatchNotFound(matchId);
    }
    if (!match.isOpenForPredictions) {
      throw new MatchIsClosedForPredictions(matchId);
    }

    // Make sure tournament entry exists
    const entry = await this.entryStorage.findByUserAndTournament(
      userId,
      match.tournamentId,
    );
    if (!entry) {
      await this.entryStorage.save(
        new TournamentEntry(Id.generate(), userId, match.tournamentId, 0),
      );
    }

    const existingPrediction = await this.predictionStorage.findByUserAndMatch(
      userId,
      matchId,
    );
    const prediction =
      existingPrediction?.withScore(score) ??
      Prediction.create(userId, matchId, score);

    await this.predictionStorage.save(prediction);
    return prediction;
  }
}
