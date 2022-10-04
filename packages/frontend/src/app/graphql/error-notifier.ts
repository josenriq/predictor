import { Injectable } from '@angular/core';
import { GraphQLError } from 'graphql';
import { ErrorResponse } from 'apollo-link-error';
import { ServerError, ServerParseError } from 'apollo-link-http-common';
import { Observable, FetchResult, ExecutionResult } from 'apollo-link';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export type NetworkError = Error | ServerError | ServerParseError;
export type ErrorNotification = {
  graphQLErrors?: ReadonlyArray<GraphQLError>;
  networkError?: NetworkError;
  response?: ExecutionResult;
};

function isUnauthenticatedNetworkError(error?: NetworkError): boolean {
  return (
    (error as any)?.['status'] === '401' ||
    (error as any)?.['statusCode'] === '401'
  );
}

function hasUnauthenticatedGraphqlErrors(
  errors?: ReadonlyArray<GraphQLError>,
): boolean {
  return (errors ?? []).some((error: any) => error?.code === 1);
}

@Injectable({ providedIn: 'root' })
export class GraphqlErrorNotifier {
  private readonly stream$ = new Subject<ErrorNotification>();
  readonly errors$ = this.stream$.asObservable();
  readonly unauthenticated$ = this.errors$.pipe(
    filter(({ graphQLErrors, networkError }) => {
      return (
        isUnauthenticatedNetworkError(networkError) ||
        hasUnauthenticatedGraphqlErrors(graphQLErrors)
      );
    }),
  );

  handle(res: ErrorResponse | Error): Observable<FetchResult> | void {
    if (!res) return;
    if (res instanceof Error) {
      this.stream$.next({ networkError: res });
      return;
    }

    const { graphQLErrors, networkError, response } = res;
    if (!graphQLErrors && !networkError) return;
    this.stream$.next({ graphQLErrors, networkError, response });
  }
}
