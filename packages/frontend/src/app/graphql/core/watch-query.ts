import { Apollo, QueryRef } from 'apollo-angular';
import { OperationVariables, WatchQueryFetchPolicy } from '@apollo/client/core';
import { DocumentNode } from 'graphql';
import { Observable } from 'rxjs';
import { map, filter, withLatestFrom } from 'rxjs/operators';
import { CodeError, formatError } from './format-error';

export interface WatchQuery<T> {
  queryRef: QueryRef<T>;
  data$: Observable<T>;
  isLoading$: Observable<boolean>;
  error$: Observable<CodeError | undefined>;
  refetch(): Promise<void>;
}

export interface PaginatedQuery<T> extends WatchQuery<T> {
  fetchMore(): void;
}

export const watchQuery =
  <T>(
    query: DocumentNode,
    {
      variables,
      fetchPolicy,
    }: {
      variables?: OperationVariables;
      fetchPolicy?: WatchQueryFetchPolicy;
    } = {},
  ) =>
  (apollo: Apollo): WatchQuery<T> => {
    const queryRef = apollo.watchQuery<T>({
      query,
      variables,
      useInitialLoading: true,
      notifyOnNetworkStatusChange: true,
      errorPolicy: 'all',
      fetchPolicy,
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
      queryRef,
      data$,
      isLoading$,
      error$,
      async refetch(): Promise<void> {
        await queryRef.refetch();
      },
    };
  };
