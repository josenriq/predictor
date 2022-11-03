import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { Match, MutationOperation } from 'app/graphql';
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
        match {
          id
          prediction {
            id
            score
            outcome
            points
          }
        }
      }
    }
  `;
}
