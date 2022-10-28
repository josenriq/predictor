import { Guard } from '@predictor/core';
import { Id, Command } from '@predictor/domain';
import { UserNotFound, UserStorage } from '@predictor/domain/user';
import { PartyNotFound } from '../errors';
import { Party, PartyStorage } from '../party';

export type JoinPartyInput = {
  partyId: Id;
  userId: Id;
};

export class JoinParty implements Command<JoinPartyInput> {
  constructor(
    private readonly partyStorage: PartyStorage,
    private readonly userStorage: UserStorage,
  ) {
    Guard.require(this.partyStorage, 'partyStorage');
    Guard.require(this.userStorage, 'userStorage');
  }

  async execute(input: JoinPartyInput): Promise<void> {
    Guard.require(input, 'input');
    const { partyId, userId } = input;

    const user = await this.userStorage.find(userId);
    if (!user) {
      throw new UserNotFound(userId);
    }

    const party = await this.partyStorage.find(partyId);
    if (!party) {
      throw new PartyNotFound(partyId);
    }

    const updatedParty = party.addMember(userId);
    await this.partyStorage.save(updatedParty);
  }
}
