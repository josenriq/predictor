import { Guard, Maybe } from '@predictor/core';
import { Id, Query } from '@predictor/domain';
import { UserNotFound } from '../errors';
import { User, UserStorage } from '../user';

export class GetUser implements Query<Id, User> {
  constructor(private readonly storage: UserStorage) {
    Guard.require(this.storage, 'storage');
  }

  async execute(userId: Id): Promise<User> {
    Guard.require(userId, 'userId');

    const user = await this.storage.find(userId);
    if (!user) {
      throw new UserNotFound(userId);
    }
    return user;
  }
}
