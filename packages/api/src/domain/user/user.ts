import { Id, Entity, Url, Storage } from '@predictor/domain';
import { Guard, Maybe } from '@predictor/core';

export class User extends Entity<User> {
  constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly picture: Maybe<Url>,
  ) {
    super(id);
    Guard.nonempty(this.name, 'name');
  }

  toString(): string {
    return `[${this.id}] ${this.name}`;
  }
}

export type UserStorage = Storage<User>;
