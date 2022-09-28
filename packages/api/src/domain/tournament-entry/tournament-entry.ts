import { Id, Entity } from '@predictor/domain';
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

export type FindTournamentEntryInput = {
  tournamentId: Id;
  userId: Id;
};

export type CreateTournamentEntryInput = {
  tournamentId: Id;
  userId: Id;
};

export type TournamentEntryStorage = {
  create(input: CreateTournamentEntryInput): Promise<TournamentEntry>;
  find(input: FindTournamentEntryInput): Promise<Maybe<TournamentEntry>>;
};
