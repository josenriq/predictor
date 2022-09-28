import { Id, DomainError } from '@predictor/domain';

export class MatchNotFound extends DomainError {
  static readonly code = 'match:not-found';

  constructor(public readonly matchId: Id) {
    super(MatchNotFound.code, `Match with id ${matchId} not found.`);
  }
}

export class MatchNotFinished extends DomainError {
  static readonly code = 'match:not-finished';

  constructor(public readonly matchId: Id) {
    super(MatchNotFinished.code, `Match with id ${matchId} has not finished.`);
  }
}
