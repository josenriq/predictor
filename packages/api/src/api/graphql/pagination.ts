import gql from 'graphql-tag';

export const RelayPaginationTypeDef = gql`
  "A relay query response information page"
  type RelayPageInfo {
    "The start cursor (object id) for the relay response"
    startCursor: ID
    "The end cursor (object id) for the relay response"
    endCursor: ID
    "Whether the query has a next page"
    hasNextPage: Boolean!
    "Whether the query has a previous page"
    hasPreviousPage: Boolean!
  }
`;
