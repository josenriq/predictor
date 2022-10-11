import { Injectable } from '@angular/core';
import { gql } from '@apollo/client/core';
import { Match, QueryOperation } from 'app/graphql';

export type MatchesQueryResult = {
  matches: Match[];
};

@Injectable({ providedIn: 'root' })
export class MatchesQuery extends QueryOperation<MatchesQueryResult> {
  override query = gql`
    query matches {
      matches {
        id
        homeTeam {
          id
          name
        }
        awayTeam {
          id
          name
        }
        stadium
        startsAt
        stage
        group
        status
        time
        score
      }
    }
  `;
}
