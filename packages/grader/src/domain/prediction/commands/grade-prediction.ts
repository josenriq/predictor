import { Guard } from '@predictor/core';
import { Id, Command } from '@predictor/domain';
import {
  MatchNotFinished,
  MatchNotFound,
  MatchStatus,
  MatchStorage,
} from '@predictor/domain/match';
import {
  TournamentEntryNotFound,
  TournamentEntryStorage,
} from '@predictor/domain/tournament-entry';
import { PredictionNotFound } from '../errors';
import { PredictionStorage } from '../prediction';

export type GradePredictionCommandInput = {
  predictionId: Id;
};

export class GradePrediction implements Command<GradePredictionCommandInput> {
  constructor(
    private readonly predictionStorage: PredictionStorage,
    private readonly matchStorage: MatchStorage,
    private readonly entryStorage: TournamentEntryStorage,
  ) {
    Guard.require(this.predictionStorage, 'predictionStorage');
    Guard.require(this.matchStorage, 'matchStorage');
    Guard.require(this.entryStorage, 'entryStorage');
  }

  async execute(input: GradePredictionCommandInput): Promise<void> {
    Guard.require(input, 'input');

    const prediction = await this.predictionStorage.find(input.predictionId);
    if (!prediction) {
      throw new PredictionNotFound(input.predictionId);
    }

    const match = await this.matchStorage.find(prediction.matchId);
    if (!match) {
      throw new MatchNotFound(prediction.matchId);
    }
    if (match.status !== MatchStatus.Finished || !match.score) {
      throw new MatchNotFinished(prediction.matchId);
    }

    const entry = await this.entryStorage.findByTournamentAndUser(
      match.tournamentId,
      prediction.userId,
    );
    if (!entry) {
      throw new TournamentEntryNotFound(match.tournamentId, prediction.userId);
    }

    const gradedPrediction = prediction.grade(match.score, match.level);
    await this.predictionStorage.save(gradedPrediction);

    const newPoints = gradedPrediction.points as number;
    if (newPoints > 0) {
      const updatedEntry = entry.addPoints(newPoints);
      await this.entryStorage.save(updatedEntry);
    }

    // TODO: web push
    // TODO: pusher
  }
}
