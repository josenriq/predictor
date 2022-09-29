import { Id, Entity, Storage, PageOptions } from '@predictor/domain';
import { Guard, Maybe } from '@predictor/core';
import { Score } from '@predictor/domain/score';
import { MatchLevel } from '../match';

export enum PredictionOutcome {
  Exact = 'Exact',
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

export class Prediction extends Entity<Prediction> {
  constructor(
    public readonly id: Id,
    public readonly userId: Id,
    public readonly matchId: Id,
    public readonly score: Score,
    public readonly outcome: Maybe<PredictionOutcome>,
    public readonly points: Maybe<number>,
  ) {
    super(id);
    Guard.require(userId, 'userId');
    Guard.require(matchId, 'matchId');
    Guard.require(score, 'score');
  }

  grade(finalScore: Score, matchLevel: MatchLevel): Prediction {
    Guard.require(finalScore, 'finalScore');
    Guard.require(matchLevel, 'matchLevel');

    const outcome = this.score.equals(finalScore)
      ? PredictionOutcome.Exact
      : this.score.outcome === finalScore.outcome
      ? PredictionOutcome.Correct
      : PredictionOutcome.Incorrect;

    const points = Prediction.pointsForOutcome(outcome, matchLevel);

    return new Prediction(
      this.id,
      this.userId,
      this.matchId,
      this.score,
      outcome,
      points,
    );
  }

  static pointsForOutcome(
    outcome: PredictionOutcome,
    level: MatchLevel,
  ): number {
    if (outcome === PredictionOutcome.Incorrect) return 0;

    const isExact = outcome === PredictionOutcome.Exact;
    switch (level) {
      case MatchLevel.RoundOf16:
        return isExact ? 5 : 2;
      case MatchLevel.QuaterFinal:
        return isExact ? 7 : 3;
      case MatchLevel.SemiFinal:
        return isExact ? 9 : 4;
      case MatchLevel.ThirdPlace:
        return isExact ? 10 : 4;
      case MatchLevel.Final:
        return isExact ? 11 : 5;
      default:
        return isExact ? 3 : 1;
    }
  }
}

export type ListByMatchOptions = PageOptions & {
  matchId: Id;
};

export type PredictionStorage = Storage<Prediction> & {
  listByMatch(options: ListByMatchOptions): Promise<Prediction[]>;
};
