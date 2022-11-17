import { Injectable } from '@angular/core';
import { gql } from '@apollo/client/core';
import { Match, QueryOperation, SessionUser } from 'app/graphql';

export type RefetchMatchQueryResult = {
  match: Pick<
    Match,
    'id' | 'status' | 'time' | 'score' | 'isOpenForPredictions' | 'prediction'
  >;
  me: Pick<SessionUser, 'id' | 'points'>;
};

@Injectable({ providedIn: 'root' })
export class RefetchMatchQuery extends QueryOperation<
  RefetchMatchQueryResult,
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
      me {
        id
        points
      }
    }
  `;
}
