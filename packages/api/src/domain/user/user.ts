import { Id, Entity, Url, Storage } from '@predictor/domain';
import { Guard, Maybe } from '@predictor/core';

export type UserFlagValue = string | boolean | number | Date;
export type UserFlags = Record<string, UserFlagValue>;

export class User extends Entity<User> {
  constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly picture: Maybe<Url>,
    public readonly flags: UserFlags,
  ) {
    super(id);
    Guard.nonempty(this.name, 'name');
    Guard.require(this.flags, 'flags');
  }

  addFlag(flag: string, value: UserFlagValue): User {
    return new User(this.id, this.name, this.picture, {
      ...this.flags,
      [flag]: value,
    });
  }

  toString(): string {
    return `[${this.id}] ${this.name}`;
  }
}

export type UserStorage = Storage<User>;
