import { Injectable } from '@angular/core';
import { gql } from '@apollo/client/core';
import { ListRankingsInput, QueryOperation, RankingsPage } from 'app/graphql';

export type RankingsQueryResult = {
  rankings: RankingsPage;
};

@Injectable({ providedIn: 'root' })
export class RankingsQuery extends QueryOperation<
  RankingsQueryResult,
  { input: ListRankingsInput }
> {
  override query = gql`
    query rankings($input: ListRankingsInput!) {
      rankings(input: $input) {
        results {
          id
          user {
            id
            name
            picture
          }
          points
        }
        pageSize
        pageNumber
        hasMore
      }
    }
  `;
}
