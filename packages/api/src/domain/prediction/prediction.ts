import { Id, Entity, Storage, Page } from '@predictor/domain';
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

  withScore(score: Score): Prediction {
    Guard.require(score, 'score');
    Guard.clause(
      !this.isGraded,
      'Cannot change the score of a graded prediction',
    );

    return new Prediction(
      this.id,
      this.userId,
      this.matchId,
      score,
      void 0,
      void 0,
    );
  }

  get isGraded(): boolean {
    return !!this.outcome;
  }

  static create(userId: Id, matchId: Id, score: Score): Prediction {
    return new Prediction(
      Id.generate(),
      userId,
      matchId,
      score,
      void 0,
      void 0,
    );
  }
}

export type PredictionStorage = Storage<Prediction> & {
  findByUserAndMatch(userId: Id, matchId: Id): Promise<Maybe<Prediction>>;
  listByMatch(
    matchId: Id,
    limitToUserIds: Array<Id>,
    pageSize: number,
    pageNumber: number,
  ): Promise<Page<Prediction>>;
};
