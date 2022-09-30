import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core';
import http from 'http';
import express from 'express';
import { Request, Response, NextFunction, json } from 'express';
import { formatError, resolvers, typeDefs } from './graphql';
import { createContext } from './context';
import { secure } from './security';
import { DatabaseConfig, createDatabase } from '@predictor/infra/database';
import { connectToDatabase } from '@predictor/infra/mongo';
import * as Auth from './auth';

export interface ApiConfiguration {
  port: number;
  auth: Auth.AuthConfiguration;
  storage: {
    mongoUri: string;
  };
}

function useDatabase(config: DatabaseConfig) {
  return (req: Request, _: Response, next: NextFunction): void => {
    (req as any)['db'] = createDatabase(config);
    next();
  };
}

export async function bootstrap(config: ApiConfiguration): Promise<void> {
  const app = express();
  const httpServer = http.createServer(app);

  const dbConnection = await connectToDatabase(config.storage.mongoUri);

  const cors = {
    // credentials: true,
    // origin: config.corsOrigin,
  };
  // secure(app, { cors })

  app.use(json());
  app.use(useDatabase({ connection: dbConnection }));

  Auth.register(app, config.auth);

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
    formatError,
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
