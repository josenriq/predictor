import { Injectable } from '@angular/core';
import { gql } from '@apollo/client/core';
import { ListPartyPredictionsInput, Match, QueryOperation } from 'app/graphql';

export type PartyPredictionsResult = {
  match: Pick<Match, 'id' | 'partyPredictions'>;
};

@Injectable({ providedIn: 'root' })
export class PartyPredictionsQuery extends QueryOperation<
  PartyPredictionsResult,
  { matchId: string; predictionsInput: ListPartyPredictionsInput }
> {
  override query = gql`
    query partyPredictions(
      $matchId: ID!
      $predictionsInput: ListPartyPredictionsInput!
    ) {
      match(matchId: $matchId) {
        id
        partyPredictions(input: $predictionsInput) {
          results {
            id
            user {
              id
              name
              picture
            }
            score
          }
          pageSize
          pageNumber
          hasMore
        }
      }
    }
  `;
}
