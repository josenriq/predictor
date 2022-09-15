import { Apollo } from 'apollo-angular';
import { FetchPolicy, OperationVariables } from '@apollo/client/core';
import { DocumentNode } from 'graphql';
import { formatError } from './format-error';
import { lastValueFrom } from 'rxjs';

export const query =
  <T>(
    query: DocumentNode,
    {
      variables,
      fetchPolicy,
    }: { variables?: OperationVariables; fetchPolicy?: FetchPolicy } = {},
  ) =>
  async (apollo: Apollo): Promise<T> => {
    const result = await lastValueFrom(
      apollo.query<T>({
        query,
        variables,
        fetchPolicy,
        errorPolicy: 'all',
      }),
    );

    if (result.error) throw result.error;
    if (result.errors?.length) throw formatError(result.errors[0]);
    return result.data;
  };
