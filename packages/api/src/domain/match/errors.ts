import { Id, DomainError } from '@predictor/domain';

export class MatchNotFound extends DomainError {
  static readonly code = 'match:not-found';

  constructor(public readonly matchId: Id) {
    super(MatchNotFound.code, `Match with id ${matchId} not found.`);
  }
}

export class MatchIsClosedForPredictions extends DomainError {
  static readonly code = 'match:closed-for-predictions';

  constructor(public readonly matchId: Id) {
    super(
      MatchIsClosedForPredictions.code,
      `Match with id ${matchId} is closed for predictions.`,
    );
  }
}
