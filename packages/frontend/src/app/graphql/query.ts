import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import {
  WatchQueryOptions as Watch,
  QueryOptions as Fetch,
  OperationVariables,
} from '@apollo/client/core';
import { DocumentNode } from 'graphql';
import { CodeError, formatError } from './format-error';
import { filter, lastValueFrom, map, Observable, withLatestFrom } from 'rxjs';

export type WatchQueryOptions<T> = Pick<Watch<T>, 'fetchPolicy'>;
export type FetchQueryOptions<T> = Pick<Fetch<T>, 'fetchPolicy'>;

export type WatchQueryResult<T, V = OperationVariables> = {
  // queryRef: QueryRef<T>;
  data$: Observable<T>;
  isLoading$: Observable<boolean>;
  error$: Observable<CodeError | undefined>;
  refetch(): Promise<void>;
  fetchMore(variables?: V): Promise<void>;
};

@Injectable()
export abstract class QueryOperation<T extends any, V = OperationVariables> {
  protected readonly query!: DocumentNode;

  constructor(protected readonly apollo: Apollo) {}

  public watch(
    variables?: V,
    options?: WatchQueryOptions<T>,
  ): WatchQueryResult<T, V> {
    const queryRef = this.apollo.watchQuery<T, V>({
      useInitialLoading: true,
      notifyOnNetworkStatusChange: true,
      errorPolicy: 'all',
      ...(options ?? {}),
      query: this.query,
      variables,
    });

    const data$ = queryRef.valueChanges.pipe(
      filter(q => !!q.data),
      map(q => q.data),
    );
    const error$ = queryRef.valueChanges.pipe(
      map(q => (q.errors?.length ? formatError(q.errors[0]) : void 0)),
    );
    const isLoading$ = queryRef.valueChanges.pipe(
      map(q => q.loading),
      withLatestFrom(error$),
      map(([loading, error]) => loading && !error),
    );
    return {
      // queryRef: queryRef as QueryRef<T>,
      data$,
      isLoading$,
      error$,
      async refetch(): Promise<void> {
        await queryRef.refetch();
      },
      async fetchMore(variables?: V): Promise<void> {
        await queryRef.fetchMore({ variables });
      },
    };
  }

  public async fetch(
    variables?: V,
    options?: FetchQueryOptions<T>,
  ): Promise<T> {
    const result = await lastValueFrom(
      this.apollo.query<T, V>({
        errorPolicy: 'all',
        ...(options ?? {}),
        query: this.query,
        variables,
      }),
    );

    if (result.error) throw result.error;
    if (result.errors?.length) throw formatError(result.errors[0]);
    return result.data;
  }
}
