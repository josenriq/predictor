import { NgModule, ModuleWithProviders } from '@angular/core';
import { ApolloClientOptions } from '@apollo/client/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { HttpClientModule } from '@angular/common/http';
import { onError } from '@apollo/client/link/error';
import { ApolloLink } from '@apollo/client/core';
import { InMemoryCache } from '@apollo/client/cache';
import { GraphqlErrorNotifier } from './error-notifier';
import { Url } from 'app/core';

export type GraphQLModuleOptions = {
  apiBaseUri: string;
};

@NgModule({
  imports: [HttpClientModule],
})
export class GraphQLModule {
  static forRoot(
    options: GraphQLModuleOptions,
  ): ModuleWithProviders<GraphQLModule> {
    return {
      ngModule: GraphQLModule,
      providers: [
        {
          provide: APOLLO_OPTIONS,
          useFactory: (
            httpLink: HttpLink,
            notifier: GraphqlErrorNotifier,
          ): ApolloClientOptions<any> => {
            return {
              link: ApolloLink.from([
                onError(notifier.handle.bind(notifier) as any),
                httpLink.create({
                  uri: Url.join(options.apiBaseUri, '/graphql'),
                  withCredentials: true,
                }),
              ]),
              cache: new InMemoryCache({
                dataIdFromObject: object => (object as any).id,
              }),
            };
          },
          deps: [HttpLink, GraphqlErrorNotifier],
        },
      ],
    };
  }
}
