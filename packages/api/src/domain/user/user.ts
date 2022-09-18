import { Id, Entity, Storage } from '@predictor/domain';
import { Guard } from '@predictor/core';

export class User extends Entity<User> {
  constructor(public readonly id: Id, public readonly name: string) {
    super(id);
    Guard.nonempty(this.name, 'name');
  }

  toString(): string {
    return `[${this.id}] ${this.name}`;
  }
}

export type UserStorage = Storage<User>;
