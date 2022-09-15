import { FactoryProvider } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { createHttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';
import { InMemoryCache } from '@apollo/client/cache';
import { environment } from 'environments';
import { onError } from 'apollo-link-error';
import { ApolloLink } from '@apollo/client/core';
import { GraphqlErrorNotifier } from './error-notifier';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import jwtDecode from 'jwt-decode';
// import { TokenNotFoundError, TokenService } from 'app/shared/auth/token';
import { Router } from '@angular/router';

const TOKEN_EXPIRATION_OFFSET = 30 * 10000; // 30s

function createApollo(
  // tokenService: TokenService,
  router: Router,
  errorNotifier: GraphqlErrorNotifier,
) {
  const cache = new InMemoryCache({
    dataIdFromObject: object => (object as any).id,
  });

  const httpLink = createHttpLink({
    uri: environment.GRAPHQL_URI,
  });

  // const tokenLink = new TokenRefreshLink({
  //   accessTokenField: 'accessToken',
  //   isTokenValidOrUndefined: (): boolean => {
  //     const token = tokenService.accessToken;
  //     if (!token) return false;

  //     try {
  //       const { exp } = jwtDecode(token) as any;
  //       const current = Date.now();

  //       //Is token expired
  //       return !(current >= exp * 1000 - TOKEN_EXPIRATION_OFFSET);
  //     } catch {
  //       return false;
  //     }
  //   },
  //   fetchAccessToken: () => {
  //     return fetch(`${environment.THEWALL_AUTH_URL}/refresh-token`, {
  //       method: 'POST',
  //       credentials: 'include',
  //     });
  //   },
  //   handleFetch: (accessToken: string) => {
  //     tokenService.accessToken = accessToken;
  //   },
  //   handleError: (error: Error) => {
  //     if (error.message.startsWith('[Token Refresh Link]')) {
  //       const tokenError = new TokenNotFoundError();
  //       errorNotifier.handle(tokenError);
  //     }
  //   },
  // });

  // const authLink = setContext((_, { headers }) => {
  //   const accessToken = tokenService.accessToken;

  //   return {
  //     headers: {
  //       ...headers,
  //       ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
  //     },
  //   };
  // });

  return {
    link: ApolloLink.from([
      // tokenLink,
      // authLink,
      onError(
        errorNotifier.handle.bind(errorNotifier),
      ) as unknown as ApolloLink,
      httpLink,
    ]),
    cache,
  };
}

export const ApolloProvider: FactoryProvider = {
  provide: APOLLO_OPTIONS,
  useFactory: createApollo,
  deps: [/*TokenService,*/ Router, GraphqlErrorNotifier],
};
