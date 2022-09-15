import { gql } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import { watchQuery, WatchQuery, User } from 'app/graphql';

export const MeQuery = gql`
  query me {
    me {
      id
      name
    }
  }
`;

export interface MeQuery {
  me: User;
}

export const watchMeQuery = (apollo: Apollo): WatchQuery<MeQuery> => {
  return watchQuery<MeQuery>(MeQuery)(apollo);
};
