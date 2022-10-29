import { Id, Entity, Storage, Page } from '@predictor/domain';
import { Guard, Maybe } from '@predictor/core';

export class TournamentEntry extends Entity<TournamentEntry> {
  constructor(
    public readonly id: Id,
    public readonly userId: Id,
    public readonly tournamentId: Id,
    public readonly points: number,
  ) {
    super(id);
    Guard.require(userId, 'userId');
    Guard.require(tournamentId, 'tournamentId');
    Guard.greaterThanOrEqual(0, points, 'points');
  }
}

export type TournamentEntryStorage = Storage<TournamentEntry> & {
  findByUserAndTournament(
    userId: Id,
    tournamentId: Id,
  ): Promise<Maybe<TournamentEntry>>;

  listOrderedByPoints(
    tournamentId: Id,
    limitToUserIds: Maybe<Array<Id>>,
    pageSize: number,
    pageNumber: number,
  ): Promise<Page<TournamentEntry>>;
};
