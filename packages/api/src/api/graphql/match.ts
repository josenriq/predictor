import gql from 'graphql-tag';
import { Context } from '../context';
import { Guard, Maybe, None } from '@predictor/core';
import {
  ListMatches,
  Match,
  MatchStatus,
  MatchStage,
  GetMatch,
} from '@predictor/domain/match';
import { GetTeam, Team } from '@predictor/domain/team';
import {
  FindPrediction,
  ListPredictionsByParty,
  Prediction,
} from '@predictor/domain/prediction';
import { QATAR_2022 } from '@predictor/domain/tournament';
import { emptyPage, Id, Page, PageInput } from '@predictor/domain';

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
    partyPredictions(input: ListPartyPredictionsInput!): PredictionsPage!
  }

  input ListPartyPredictionsInput {
    pageSize: Int = 20
    pageNumber: Int = 0
    partyId: ID!
  }

  type PredictionsPage {
    results: [Prediction!]!
    pageSize: Int!
    pageNumber: Int!
    hasMore: Boolean!
  }

  type Query {
    matches: [Match!]!
    match(matchId: ID!): Match!
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

    async partyPredictions(
      match: Match,
      { input }: { input: PageInput & { partyId: Id } },
      ctx: Context,
    ): Promise<Page<Prediction>> {
      if (!ctx.viewer) return emptyPage();

      const query = new ListPredictionsByParty(
        ctx.predictionStorage,
        ctx.matchStorage,
        ctx.partyStorage,
      );
      return await query.execute({
        ...input,
        matchId: match.id,
        excludedUserId: ctx.viewer.id,
      });
    },
  },

  Query: {
    async matches(
      parent: None,
      args: None,
      ctx: Context,
    ): Promise<Array<Match>> {
      const query = new ListMatches(ctx.matchStorage);
      return query.execute(QATAR_2022);
    },

    match(
      parent: None,
      { matchId }: { matchId: Id },
      ctx: Context,
    ): Promise<Match> {
      Guard.require(matchId, 'matchId');
      const query = new GetMatch(ctx.matchStorage);
      return query.execute(matchId);
    },
  },
};
