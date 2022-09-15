import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import http from 'http';
import express from 'express';
import { Request, Response, NextFunction, json } from 'express';
// import IORedis from 'ioredis';
// import { connectRedis } from '@thewall-accounts/infra/redis/connect';
import { resolvers, typeDefs } from './graphql';
import { createContext } from './context';
import { secure } from './security';
// import cookieParser from 'cookie-parser';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

export interface ApiConfiguration {
  port: number;
  storage: {
    redisUri: string;
  };
}

// function useSlidebeanDatabase(
//   config: SlidebeanDatabaseConfiguration,
//   databaseFactory: SlidebeanDatabaseFactory,
// ) {
//   return (req: Request, _: Response, next: NextFunction): void => {
//     (req as any)['db'] = databaseFactory(config);
//     next();
//   };
// }

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
  // const [
  //   schema,
  //   // authTokenRedis,
  // ] = await Promise.all([
  //   createSchema(),
  //   // connectRedis(config.auth.redisUrl),
  // ]);

  const app = express();
  const httpServer = http.createServer(app);

  const cors = {
    // credentials: true,
    // origin: config.corsOrigin,
  };

  secure(app, { cors }).use(json());
  // .use(cookieParser(config.auth.cookie.secret))
  // .use(useRefreshTokens(authTokenRedis));

  // registerAuth(app, {
  //   ...config.auth,
  // });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    // formatError,
    introspection: true,
  });
  await server.start();

  server.applyMiddleware({
    app: app as any,
    path: '/graphql',
  });

  // app.use(errorHandler);

  await new Promise(resolve =>
    httpServer.listen({ port: config.port }, resolve as any),
  );
  console.log(`🚀 Predictor Api is running on http://localhost:${config.port}`);
}
