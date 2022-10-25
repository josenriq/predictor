import { Guard, Maybe } from '@predictor/core';
import { Id, Query } from '@predictor/domain';
import { TournamentEntry, TournamentEntryStorage } from '../tournament-entry';

export type FindTournamentEntryInput = {
  userId: Id;
  tournamentId: Id;
};

export class FindTournamentEntry
  implements Query<FindTournamentEntryInput, Maybe<TournamentEntry>>
{
  constructor(private readonly storage: TournamentEntryStorage) {
    Guard.require(this.storage, 'storage');
  }

  execute(input: FindTournamentEntryInput): Promise<Maybe<TournamentEntry>> {
    Guard.require(input, 'input');
    return this.storage.findByUserAndTournament(
      input.userId,
      input.tournamentId,
    );
  }
}
