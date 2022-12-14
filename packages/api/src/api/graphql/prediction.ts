import gql from 'graphql-tag';
import { Context } from '../context';
import { Guard, None } from '@predictor/core';
import {
  Prediction,
  PredictionOutcome,
  SavePrediction,
} from '@predictor/domain/prediction';
import { AuthenticationRequired, Id } from '@predictor/domain';
import { Score } from '@predictor/domain/score';
import { GetMatch, Match } from '@predictor/domain/match';
import { User, GetUser } from '@predictor/domain/user';

export const PredictionTypeDef = gql`
  enum PredictionOutcome {
    Exact
    Correct
    Incorrect
  }

  type Prediction {
    id: ID!
    score: Score!
    outcome: PredictionOutcome
    points: Int
    user: User!
  }

  input SavePredictionInput {
    matchId: ID!
    score: Score!
  }

  type SavePredictionOutput {
    match: Match!
  }

  type Mutation {
    savePrediction(input: SavePredictionInput!): SavePredictionOutput!
  }
`;

export const PredictionResolver = {
  PredictionOutcome,

  Prediction: {
    user(prediction: Prediction, args: None, ctx: Context): Promise<User> {
      const query = new GetUser(ctx.userStorage);
      return query.execute(prediction.userId);
    },
  },

  Mutation: {
    async savePrediction(
      parent: None,
      { input }: { input: { matchId: Id; score: Score } },
      ctx: Context,
    ): Promise<{ match: Match }> {
      Guard.require(input, 'input');

      if (!ctx.viewer) {
        throw new AuthenticationRequired();
      }

      const command = new SavePrediction(
        ctx.predictionStorage,
        ctx.matchStorage,
        ctx.tournamentEntryStorage,
      );

      await command.execute({
        ...input,
        userId: ctx.viewer?.id as Id,
      });

      const query = new GetMatch(ctx.matchStorage);
      const match = await query.execute(input.matchId);
      return { match };
    },
  },
};
