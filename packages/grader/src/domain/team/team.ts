import { Id, Entity } from '@predictor/domain';
import { Guard, Maybe } from '@predictor/core';

export class Team extends Entity<Team> {
  constructor(public readonly id: Id, public readonly name: string) {
    super(id);
    Guard.nonempty(this.name, 'name');
  }

  toString(): string {
    return `[${this.id}] ${this.name}`;
  }
}

export type TeamStorage = {
  find(teamId: Id): Promise<Maybe<Team>>;
};
