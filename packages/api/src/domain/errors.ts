import { DomainError } from './domain-error';

export class AuthenticationRequired extends DomainError {
  static readonly code = 'auth:required';

  constructor() {
    super(AuthenticationRequired.code, `Authentication is required.`);
  }
}
