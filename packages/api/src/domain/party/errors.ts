import { Id, DomainError } from '@predictor/domain';

export class PartyNotFound extends DomainError {
  static readonly code = 'party:not-found';

  constructor(public readonly partyId: Id) {
    super(PartyNotFound.code, `Party with id ${partyId} not found.`);
  }
}
