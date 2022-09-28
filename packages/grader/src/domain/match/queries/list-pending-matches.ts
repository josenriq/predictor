import { Guard } from '@predictor/core';
import { Id, Query } from '@predictor/domain';
import { Match, MatchStorage } from '../match';

export class ListPendingMatches implements Query<Id, Array<Match>> {
  constructor(private readonly storage: MatchStorage) {
    Guard.require(this.storage, 'storage');
  }

  execute(tournamentId: Id): Promise<Array<Match>> {
    Guard.require(tournamentId, 'tournamentId');

    return this.storage.listPendingByTournament(tournamentId);
  }
}
