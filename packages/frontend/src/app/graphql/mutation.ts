import { Injectable } from '@angular/core';
import {
  MutationOptions as Mutate,
  OperationVariables,
  ApolloError,
  PureQueryOptions,
} from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import { DocumentNode } from 'graphql';
import { FetchResult } from '@apollo/client/core';
import { DataProxy } from '@apollo/client/cache';
import { formatError } from './format-error';
// import { RefetchQueryDescription } from '@apollo/client/core/watchQueryOptions';

export type MutationOptions<T, V> = Omit<
  Mutate<T, V>,
  'mutation' | 'query' | 'variables'
>;

@Injectable()
export abstract class MutationOperation<T extends any, V = OperationVariables> {
  protected readonly mutation!: DocumentNode;
  protected readonly refetchQueries?: Array<
    string | DocumentNode | PureQueryOptions
  >;
  protected readonly optimisticResponse?: T | ((vars: V) => T);

  constructor(protected readonly apollo: Apollo) {}

  public mutate(
    variables?: V,
    options?: MutationOptions<T, V>,
  ): Promise<T | void> {
    return new Promise((resolve, reject) =>
      this.apollo
        .mutate<T, V>({
          ...options,
          mutation: this.mutation,
          variables,
          refetchQueries: this.refetchQueries?.map(q =>
            typeof q == 'string' || (typeof q === 'object' && 'query' in q)
              ? q
              : { query: q },
          ),
          optimisticResponse: this.optimisticResponse,
        })
        .subscribe({
          next: ({ data }) => resolve(data ?? void 0),
          error: (error: ApolloError) =>
            reject(
              error.graphQLErrors?.length
                ? formatError(error.graphQLErrors[0])
                : error,
            ),
        }),
    );
  }
}

// {
// variables,
// awaitRefetchQueries = false,
// optimisticResponse,
// update,
// }: {
// variables?: OperationVariables;
// refetchQueries?: Array<string | DocumentNode | PureQueryOptions>;
// awaitRefetchQueries?: boolean;
// optimisticResponse?: T | ((vars: OperationVariables) => T);
// update?: Mutate<T>['update'];
// } = {}): Promise<T> {
