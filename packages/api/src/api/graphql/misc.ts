import gql from 'graphql-tag';

export const SuccessOutputTypeDef = gql`
  type SuccessOutput {
    success: Boolean!
  }
`;
