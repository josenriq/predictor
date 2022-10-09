import { Guard } from '@predictor/core';
import { Id, Command } from '@predictor/domain';
import {
  MatchNotFinished,
  MatchNotFound,
  MatchStatus,
  MatchStorage,
} from '@predictor/domain/match';
import {
  TournamentEntry,
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

    const originalPrediction = await this.predictionStorage.find(
      input.predictionId,
    );
    if (!originalPrediction) {
      throw new PredictionNotFound(input.predictionId);
    }

    const { userId, matchId } = originalPrediction;

    const match = await this.matchStorage.find(matchId);
    if (!match) {
      throw new MatchNotFound(matchId);
    }
    if (match.status !== MatchStatus.Finished || !match.score) {
      throw new MatchNotFinished(matchId);
    }

    const entry =
      (await this.entryStorage.findByUserAndTournament(
        userId,
        match.tournamentId,
      )) ?? new TournamentEntry(Id.generate(), userId, match.tournamentId, 0);

    const gradedPrediction = originalPrediction.grade(match.score, match.stage);
    await this.predictionStorage.save(gradedPrediction);

    const newPoints =
      (gradedPrediction.points ?? 0) - (originalPrediction.points ?? 0);

    if (newPoints !== 0) {
      const updatedEntry = entry.addPoints(newPoints);
      await this.entryStorage.save(updatedEntry);
    }

    // TODO: web push
    // TODO: pusher
  }
}
