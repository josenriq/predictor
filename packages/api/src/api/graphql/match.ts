import gql from 'graphql-tag';
import { Context } from '../context';
import { Maybe, None } from '@predictor/core';
import {
  ListMatches,
  Match,
  MatchStatus,
  MatchStage,
} from '@predictor/domain/match';
import { GetTeam, Team } from '@predictor/domain/team';
import { Id } from '@predictor/domain';
import { FindPrediction, Prediction } from '@predictor/domain/prediction';

export const MatchTypeDef = gql`
  enum MatchStage {
    Regular
    Group
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
    stadium: String
    startsAt: DateTime!
    stage: MatchStage!
    group: String
    status: MatchStatus!
    score: Score
    time: String
    isOpenForPredictions: Boolean!
    prediction: Prediction
  }

  type Query {
    matches: [Match!]!
  }
`;

export const MatchResolver = {
  MatchStage,
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

    async prediction(
      match: Match,
      _: None,
      ctx: Context,
    ): Promise<Maybe<Prediction>> {
      if (!ctx.viewer) return void 0;
      const query = new FindPrediction(ctx.predictionStorage);
      return await query.execute({ matchId: match.id, userId: ctx.viewer.id });
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
