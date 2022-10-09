import { Id, Entity, Storage, PageOptions } from '@predictor/domain';
import { Guard, Maybe } from '@predictor/core';
import { Score } from '@predictor/domain/score';
import { MatchStage } from '../match';

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

  grade(finalScore: Score, matchStage: MatchStage): Prediction {
    Guard.require(finalScore, 'finalScore');
    Guard.require(matchStage, 'matchStage');

    const outcome = this.score.equals(finalScore)
      ? PredictionOutcome.Exact
      : this.score.outcome === finalScore.outcome
      ? PredictionOutcome.Correct
      : PredictionOutcome.Incorrect;

    const points = Prediction.pointsForOutcome(outcome, matchStage);

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
    stage: MatchStage,
  ): number {
    if (outcome === PredictionOutcome.Incorrect) return 0;

    const isExact = outcome === PredictionOutcome.Exact;
    switch (stage) {
      case MatchStage.RoundOf16:
        return isExact ? 5 : 2;
      case MatchStage.QuaterFinal:
        return isExact ? 7 : 3;
      case MatchStage.SemiFinal:
        return isExact ? 9 : 4;
      case MatchStage.ThirdPlace:
        return isExact ? 10 : 4;
      case MatchStage.Final:
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
