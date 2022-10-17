import { Guard } from '@predictor/core';
import { Id, Command } from '@predictor/domain';
import { UserNotFound } from '../errors';
import { UserFlagValue, UserStorage } from '../user';

export type SaveUserFlagInput = {
  userId: Id;
  flag: string;
  value: UserFlagValue;
};

export class SaveUserFlag implements Command<SaveUserFlagInput> {
  constructor(private readonly userStorage: UserStorage) {
    Guard.require(this.userStorage, 'userStorage');
  }

  async execute(input: SaveUserFlagInput): Promise<void> {
    Guard.require(input, 'input');
    const { userId, flag, value } = input;

    const user = await this.userStorage.find(userId);
    if (!user) {
      throw new UserNotFound(userId);
    }

    const updatedUser = user.addFlag(flag, value);
    await this.userStorage.save(updatedUser);
  }
}
