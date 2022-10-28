import { Guard } from '@predictor/core';
import { Id, Command } from '@predictor/domain';
import { UserNotFound, UserStorage } from '@predictor/domain/user';
import { Party, PartyStorage } from '../party';

export type CreatePartyInput = {
  ownerId: Id;
  name: string;
};

export class CreateParty implements Command<CreatePartyInput, Party> {
  constructor(
    private readonly partyStorage: PartyStorage,
    private readonly userStorage: UserStorage,
  ) {
    Guard.require(this.partyStorage, 'partyStorage');
    Guard.require(this.userStorage, 'userStorage');
  }

  async execute(input: CreatePartyInput): Promise<Party> {
    Guard.require(input, 'input');
    const { ownerId, name } = input;

    const owner = await this.userStorage.find(ownerId);
    if (!ownerId) {
      throw new UserNotFound(ownerId);
    }

    const party = Party.create(name, ownerId);
    await this.partyStorage.save(party);
    return party;
  }
}
