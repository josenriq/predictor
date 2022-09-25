import gql from 'graphql-tag';
import { Context } from '../context';
import { None } from '@predictor/core';
import {
  ListMatches,
  Match,
  MatchStatus,
  MatchLevel,
} from '@predictor/domain/match';
import { GetTeam, Team } from '@predictor/domain/team';
import { Id } from '@predictor/domain';

export const MatchTypeDef = gql`
  enum MatchLevel {
    Regular
    GroupStage
    RoundOf16
    QuaterFinal
    SemiFinal
    ThirdPlace
    Final
  }

  enum MatchStatus {
    Unstarted
    Ongoing
    Finished
    Cancelled
    Postponed
  }

  type Match {
    id: ID!
    homeTeam: Team!
    awayTeam: Team!
    startsAt: DateTime!
    level: MatchLevel!
    group: String
    status: MatchStatus!
    score: Score
    time: String
    prediction: String
  }

  type Query {
    matches: [Match!]!
  }
`;

export const MatchResolver = {
  MatchLevel,
  MatchStatus,

  Match: {
    homeTeam(match: Match, _: None, ctx: Context): Promise<Team> {
      const query = new GetTeam(ctx.teamStorage);
      return query.execute(match.homeTeamId);
    },
    awayTeam(match: Match, _: None, ctx: Context): Promise<Team> {
      const query = new GetTeam(ctx.teamStorage);
      return query.execute(match.awayTeamId);
    },
    time(): string {
      return `21`;
    },
    prediction(): string {
      return 'TODO!';
    },
  },

  Query: {
    async matches(
      parent: unknown,
      args: unknown,
      ctx: Context,
    ): Promise<Array<Match>> {
      const query = new ListMatches(ctx.matchStorage);
      return query.execute(Id.decode('qatar2022')); // TODO: Hardcoded Qatar 2022 :)
    },
  },
};
