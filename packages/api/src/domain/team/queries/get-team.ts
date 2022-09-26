import { Guard } from '@predictor/core';
import { Id, Query } from '@predictor/domain';
import { TeamNotFound } from '../errors';
import { Team, TeamStorage } from '../team';

export class GetTeam implements Query<Id, Team> {
  constructor(private readonly storage: TeamStorage) {
    Guard.require(this.storage, 'storage');
  }

  async execute(teamId: Id): Promise<Team> {
    Guard.require(teamId, 'teamId');

    const team = await this.storage.find(teamId);
    if (!team) {
      throw new TeamNotFound(teamId);
    }
    return team;
  }
}
