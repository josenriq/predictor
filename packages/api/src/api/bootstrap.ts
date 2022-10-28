import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
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
  frontendUrl: string;
  auth: Omit<Auth.AuthConfiguration, 'redirectionUrl'>;
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

export async function bootstrap(
  config: ApiConfiguration,
): Promise<express.Express> {
  const app = express();

  const dbConnection = await connectToDatabase(config.storage.mongoUri);

  const cors = {
    credentials: true,
    origin: [config.frontendUrl, 'https://studio.apollographql.com'],
  };
  secure(app, { cors });

  app.use(json());
  app.use(useDatabase({ connection: dbConnection }));

  Auth.register(app, { ...config.auth, redirectionUrl: config.frontendUrl });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      // TODO: Only in dev
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
    formatError,
    introspection: true,
  });
  await server.start();

  server.applyMiddleware({ app, cors });
  server.applyMiddleware({ app, path: '/graphql' });

  // app.use(errorHandler);

  return app;
}
