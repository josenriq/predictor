import { Id, DomainError } from '@predictor/domain';

export class UserNotFound extends DomainError {
  static readonly code = 'user:not-found';

  constructor(public readonly userId: Id) {
    super(UserNotFound.code, `User with id ${userId} not found.`);
  }
}
