import { Injectable } from '@angular/core';
import { gql } from '@apollo/client/core';
import { Match, QueryOperation } from 'app/graphql';

export type MatchQueryResult = {
  match: Pick<
    Match,
    'id' | 'status' | 'time' | 'score' | 'isOpenForPredictions' | 'prediction'
  >;
};

@Injectable({ providedIn: 'root' })
export class MatchQuery extends QueryOperation<
  MatchQueryResult,
  { matchId: string }
> {
  override query = gql`
    query match($matchId: ID!) {
      match(matchId: $matchId) {
        id
        status
        time
        score
        isOpenForPredictions
        prediction {
          id
          score
          outcome
          points
        }
      }
    }
  `;
}
