import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { MutationOperation } from 'app/graphql';
import { SavePredictionInput, SavePredictionOutput } from 'app/graphql';

export type SavePredictionResult = {
  savePrediction: SavePredictionOutput;
};

@Injectable({ providedIn: 'root' })
export class SavePredictionMutation extends MutationOperation<
  SavePredictionResult,
  { input: SavePredictionInput }
> {
  override mutation = gql`
    mutation SavePrediction($input: SavePredictionInput!) {
      savePrediction(input: $input) {
        prediction {
          id
          score
        }
      }
    }
  `;

  override optimisticResponse = ({
    input,
  }: {
    input: SavePredictionInput;
  }): SavePredictionResult => ({
    savePrediction: {
      __typename: 'SavePredictionOutput',
      prediction: {
        __typename: 'Prediction',
        id: 'temp-id',
        score: input.score,
      },
    } as SavePredictionOutput,
  });
}
