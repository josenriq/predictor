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
  }

  input SavePredictionInput {
    matchId: ID!
    score: Score!
  }

  type SavePredictionOutput {
    prediction: Prediction!
  }

  type Mutation {
    savePrediction(input: SavePredictionInput!): SavePredictionOutput
  }
`;

export const PredictionResolver = {
  PredictionOutcome,

  Prediction: {},

  Mutation: {
    async savePrediction(
      parent: None,
      { input }: { input: { matchId: Id; score: Score } },
      ctx: Context,
    ): Promise<{ prediction: Prediction }> {
      Guard.require(input, 'input');

      if (!ctx.viewer) {
        throw new AuthenticationRequired();
      }

      const command = new SavePrediction(
        ctx.predictionStorage,
        ctx.matchStorage,
        ctx.tournamentEntryStorage,
      );

      const prediction = await command.execute({
        ...input,
        userId: ctx.viewer?.id as Id,
      });
      return { prediction };
    },
  },
};
