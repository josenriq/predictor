import { Id, Entity, Storage } from '@predictor/domain';
import { Guard, Maybe } from '@predictor/core';
import { Score } from '@predictor/domain/score';

export enum MatchStage {
  Regular = 'Regular',
  Group = 'Group',
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

export class Match extends Entity<Match> {
  constructor(
    public readonly id: Id,
    public readonly tournamentId: Id,
    public readonly homeTeamId: Id,
    public readonly awayTeamId: Id,
    public readonly startsAt: Date,
    public readonly stage: MatchStage,
    public readonly status: MatchStatus,
    public readonly score: Maybe<Score>,
    public readonly time: Maybe<string>,
  ) {
    super(id);
  }

  withNewStatus(
    status: MatchStatus,
    score: Maybe<Score>,
    time: Maybe<string>,
  ): Match {
    Guard.require(status, 'status');
    if ([MatchStatus.Ongoing, MatchStatus.Finished].includes(status)) {
      Guard.require(score, 'score');
    }
    return new Match(
      this.id,
      this.tournamentId,
      this.homeTeamId,
      this.awayTeamId,
      this.startsAt,
      this.stage,
      status,
      score,
      time,
    );
  }

  toString(): string {
    return `[${this.startsAt}] ${this.homeTeamId} vs ${this.awayTeamId}`;
  }
}

export type MatchStorage = Storage<Match> & {
  listPendingByTournament(tournamentId: Id): Promise<Match[]>;
};

export type MatchChecker = {
  checkForUpdates(matches: Match[]): Promise<Match[]>;
};

export type MatchNotifier = {
  notify(match: Match): Promise<void>;
};
