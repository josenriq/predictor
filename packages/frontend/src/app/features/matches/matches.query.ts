import { gql } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import { watchQuery, WatchQuery, Match } from 'app/graphql';

export const MatchesQuery = gql`
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
      level
      group
      status
      time
      score
    }
  }
`;

export interface MatchesQuery {
  matches: Match[];
}

export const watchMatchesQuery = (apollo: Apollo): WatchQuery<MatchesQuery> => {
  return watchQuery<MatchesQuery>(MatchesQuery)(apollo);
};
