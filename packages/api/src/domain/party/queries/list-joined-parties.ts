import { Guard, Maybe } from '@predictor/core';
import { Id, Query } from '@predictor/domain';
import { Party, PartyStorage } from '../party';

export class ListJoinParties implements Query<Id, Array<Party>> {
  constructor(private readonly storage: PartyStorage) {
    Guard.require(this.storage, 'storage');
  }

  async execute(userId: Id): Promise<Array<Party>> {
    Guard.require(userId, 'userId');

    return await this.storage.listByMember(userId);
  }
}
