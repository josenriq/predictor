import { Id, Entity } from '@predictor/domain';
import { Maybe } from '@predictor/core';
import { Score } from '@predictor/domain/score';

export enum MatchLevel {
  Regular = 'Regular',
  GroupStage = 'GroupStage',
  RoundOf16 = 'RoundOf16',
  QuaterFinal = 'QuaterFinal',
  SemiFinal = 'SemiFinal',
  ThirdPlace = 'ThirdPlace',
  Final = 'Final',
}

export enum MatchStatus {
  Unstarted = 'Unstarted',
  Ongoing = 'Ongoing',
  Finished = 'Finished',
  Cancelled = 'Cancelled',
  Postponed = 'Postponed',
}

export type TournamentGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export class Match extends Entity<Match> {
  constructor(
    public readonly id: Id,
    public readonly tournamentId: Id,
    public readonly homeTeamId: Id,
    public readonly awayTeamId: Id,
    public readonly startsAt: Date,
    public readonly level: MatchLevel,
    public readonly group: Maybe<TournamentGroup>,
    public readonly status: MatchStatus,
    public readonly score: Maybe<Score>,
  ) {
    super(id);
  }

  toString(): string {
    return `[${this.startsAt}] ${this.homeTeamId} vs ${this.awayTeamId}`;
  }
}

export type MatchStorage = {
  listByTournament(tournamentId: Id): Promise<Array<Match>>;
};
