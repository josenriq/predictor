import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import http from 'http';
import express from 'express';
import { Request, Response, NextFunction, json } from 'express';
import { resolvers, typeDefs } from './graphql';
import { createContext } from './context';
import { secure } from './security';
// import cookieParser from 'cookie-parser';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { TeamModel } from '@predictor/infra/team';
import { MatchModel } from '@predictor/infra/match';

export interface ApiConfiguration {
  port: number;
  storage: {
    redisUri: string;
  };
}

function useDatabase() {
// config: SlidebeanDatabaseConfiguration,
// databaseFactory: SlidebeanDatabaseFactory,
  return (req: Request, _: Response, next: NextFunction): void => {
    (req as any)['teamStorage'] = new TeamModel();
    (req as any)['matchStorage'] = new MatchModel();
    next();
  };
}

// function isDomainError(error: any): error is DomainError {
//   return error?.message && error?.code;
// }

// function formatError(error: GraphQLError): GraphQLFormattedError {
//   if (isDomainError(error?.originalError)) {
//     const domainError = error.originalError as DomainError;
//     return {
//       message: domainError.message,
//       extensions: {
//         code: domainError.code,
//       },
//     };
//   }
//   return error;
// }

export async function bootstrap(config: ApiConfiguration): Promise<void> {
  const app = express();
  const httpServer = http.createServer(app);

  const cors = {
    // credentials: true,
    // origin: config.corsOrigin,
  };
  // secure(app, { cors })

  app.use(json());
  app.use(useDatabase());

  // .use(cookieParser(config.auth.cookie.secret))
  // .use(useRefreshTokens(authTokenRedis));

  // registerAuth(app, {
  //   ...config.auth,
  // });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // TODO: Only in dev
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
    // formatError,
    introspection: true,
  });
  await server.start();

  server.applyMiddleware({ app, path: '/graphql' });

  // app.use(errorHandler);

  await new Promise(resolve =>
    httpServer.listen({ port: config.port }, resolve as any),
  );
  console.log(`🚀 Predictor Api is running on http://localhost:${config.port}`);
}
