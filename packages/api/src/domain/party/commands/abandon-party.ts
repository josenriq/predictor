import { Guard } from '@predictor/core';
import { Id, Command } from '@predictor/domain';
import { PartyNotFound } from '../errors';
import { PartyStorage } from '../party';

export type AbandonPartyInput = {
  partyId: Id;
  userId: Id;
};

export class AbandonParty implements Command<AbandonPartyInput> {
  constructor(private readonly partyStorage: PartyStorage) {
    Guard.require(this.partyStorage, 'partyStorage');
  }

  async execute(input: AbandonPartyInput): Promise<void> {
    Guard.require(input, 'input');
    const { partyId, userId } = input;

    const party = await this.partyStorage.find(partyId);
    if (!party) {
      throw new PartyNotFound(partyId);
    }

    const updatedParty = party.removeMember(userId);
    if (updatedParty.hasMembers()) {
      await this.partyStorage.save(updatedParty);
    } else {
      await this.partyStorage.delete(partyId);
    }
  }
}
