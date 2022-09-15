import { Apollo } from 'apollo-angular';
import {
  ApolloError,
  MutationOptions,
  OperationVariables,
  PureQueryOptions,
} from '@apollo/client/core';
import { DocumentNode } from 'graphql';
import { formatError } from './format-error';

export const mutate =
  <T>(
    mutation: DocumentNode,
    {
      variables,
      refetchQueries,
      awaitRefetchQueries = false,
      optimisticResponse,
      update,
    }: {
      variables?: OperationVariables;
      refetchQueries?: Array<string | DocumentNode | PureQueryOptions>;
      awaitRefetchQueries?: boolean;
      optimisticResponse?: T | ((vars: OperationVariables) => T);
      update?: MutationOptions<T>['update'];
    } = {},
  ) =>
  (apollo: Apollo): Promise<T | null | undefined> => {
    return new Promise((resolve, reject) => {
      apollo
        .mutate<T>({
          mutation,
          variables,
          refetchQueries: refetchQueries?.map(q =>
            typeof q == 'string' || (typeof q === 'object' && 'query' in q)
              ? q
              : { query: q },
          ),
          awaitRefetchQueries: awaitRefetchQueries && !!refetchQueries?.length,
          optimisticResponse,
          update,
        })
        .subscribe({
          next: ({ data }) => resolve(data),
          error: (error: ApolloError) =>
            reject(
              error.graphQLErrors?.length
                ? formatError(error.graphQLErrors[0])
                : error,
            ),
        });
    });
  };
