import { Id } from '../id';
import { Entity } from '../entity';
import { Guard } from '@predictor/core';

export class Team extends Entity<Team> {
  constructor(public readonly id: Id, public name: string) {
    super(id);
    Guard.nonempty(this.name, 'name');
  }

  toString(): string {
    return `[${this.id}] ${this.name}`;
  }
}

export type TeamStorage = {
  get(id: Id): Promise<Team>;
};
