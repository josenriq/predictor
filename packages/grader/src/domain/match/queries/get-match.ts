import { Guard } from '@predictor/core';
import { Id, Query } from '@predictor/domain';
import { MatchNotFound } from '../errors';
import { Match, MatchStorage } from '../match';

export class GetMatch implements Query<Id, Match> {
  constructor(private readonly storage: MatchStorage) {
    Guard.require(this.storage, 'storage');
  }

  async execute(matchId: Id): Promise<Match> {
    Guard.require(matchId, 'matchId');

    const match = await this.storage.find(matchId);
    if (!match) {
      throw new MatchNotFound(matchId);
    }
    return match;
  }
}
