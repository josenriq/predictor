import { Guard, Maybe } from '@predictor/core';
import { Id, Query } from '@predictor/domain';
import { PartyNotFound } from '../errors';
import { Party, PartyStorage } from '../party';

export class GetParty implements Query<Id, Party> {
  constructor(private readonly storage: PartyStorage) {
    Guard.require(this.storage, 'storage');
  }

  async execute(partyId: Id): Promise<Party> {
    Guard.require(partyId, 'partyId');

    const party = await this.storage.find(partyId);
    if (!party) {
      throw new PartyNotFound(partyId);
    }
    return party;
  }
}
