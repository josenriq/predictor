import { Id, DomainError } from '@predictor/domain';

export class TeamNotFound extends DomainError {
  static readonly code = 'team:not-found';

  constructor(public readonly teamId: Id) {
    super(TeamNotFound.code, `Team with id ${teamId} not found.`);
  }
}
