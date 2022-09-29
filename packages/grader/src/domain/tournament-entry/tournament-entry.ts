import { Id, Entity, Storage } from '@predictor/domain';
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

  addPoints(points: number): TournamentEntry {
    Guard.integer(points, 'points');

    return new TournamentEntry(
      this.id,
      this.userId,
      this.tournamentId,
      this.points + points,
    );
  }
}

export type TournamentEntryStorage = Storage<TournamentEntry> & {
  findByUserAndTournament(
    userId: Id,
    tournamentId: Id,
  ): Promise<Maybe<TournamentEntry>>;
};
