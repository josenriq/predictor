import { Guard, Maybe } from '@predictor/core';
import { Id, Url } from '@predictor/domain';
import { User } from '@predictor/domain/user';
import { Database } from '@predictor/infra/database';
import { Application, Router } from 'express';
import { auth } from 'express-openid-connect';
import { verify } from 'jsonwebtoken';

export type AuthConfiguration = {
  baseUrl: string;
  issuerBaseUrl: string;
  redirectionUrl: string;
  clientID: string;
  clientSecret: string;
  cookieSecret: string;
};

export function register(
  app: Application,
  config: AuthConfiguration,
): Application {
  Guard.require(app, 'app');
  Guard.require(config, 'config');

  const authRoute = Router();

  // Attach /login, /logout, and /callback routes to the baseURL
  authRoute.use(
    auth({
      baseURL: config.baseUrl,
      issuerBaseURL: config.issuerBaseUrl,
      clientID: config.clientID,
      clientSecret: config.clientSecret,
      secret: config.cookieSecret,
      authRequired: false,
      auth0Logout: true,
      idTokenSigningAlg: 'HS256',
      routes: {
        login: false,
        postLogoutRedirect: config.redirectionUrl,
      },
      afterCallback: async (req, res, session) => {
        const db = (req as any)['db'] as Database;

        const record = verify(session.id_token, config.clientSecret, {
          algorithms: ['HS256'],
        });
        const user = deserializeUser(record as Record<string, any>);
        if (!user) {
          throw new Error('Could not deserialize user from id token');
        }

        // Save user in our db if it doesn't exist
        const existingUser = await db.user.find(user.id);
        if (!existingUser) await db.user.save(user);

        return session;
      },
    }),
  );

  authRoute.get('/login', (req, res) =>
    res.oidc.login({ returnTo: config.redirectionUrl }),
  );

  return app.use('/', authRoute);
}

export function deserializeUser(record: Record<string, any>): Maybe<User> {
  try {
    return new User(
      Id.decode(record['sub'] ?? record['id']),
      record['given_name'] ?? record['name'] ?? record['email'],
      record['picture'] ? Url.decode(record['picture']) : void 0,
    );
  } catch (error) {
    console.error('Could not deserialize user', error);
    return void 0;
  }
}
