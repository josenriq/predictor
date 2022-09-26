import { Id, Entity } from '@predictor/domain';
import { Guard, Maybe } from '@predictor/core';
import { Score } from '@predictor/domain/score';

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

  get isGraded(): boolean {
    return !!this.outcome;
  }
}

export type FindPredictionInput = {
  matchId: Id;
  userId: Id;
};

export type SavePredictionInput = {
  matchId: Id;
  userId: Id;
  score: Score;
};

export type PredictionStorage = {
  save(input: SavePredictionInput): Promise<Prediction>;
  find(input: FindPredictionInput): Promise<Maybe<Prediction>>;
};
