import { Id } from '../id';
import { Entity } from '../entity';
import { Guard } from '@predictor/core';

export class User extends Entity<User> {
  constructor(public readonly id: Id, public name: string) {
    super(id);
    Guard.nonempty(this.name, 'name');
  }

  toString(): string {
    return `[${this.id}] ${this.name}`;
  }
}

export type UserStorage = {
  get(id: Id): Promise<User>;
};
