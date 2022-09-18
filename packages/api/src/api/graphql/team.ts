import gql from 'graphql-tag';

export const TeamTypeDef = gql`
  type Team {
    id: ID!
    name: String!
  }
`;

export const TeamResolver = {
  Team: {},
};
