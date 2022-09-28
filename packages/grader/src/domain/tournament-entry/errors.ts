import { Id, DomainError } from '@predictor/domain';

export class TournamentEntryNotFound extends DomainError {
  static readonly code = 'tournament-entry:not-found';

  constructor(public readonly tournamentId: Id, public readonly userId: Id) {
    super(
      TournamentEntryNotFound.code,
      `TournamentEntry with tournament id ${tournamentId} and user id ${userId} not found.`,
    );
  }
}
