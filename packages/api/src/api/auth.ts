import { Guard } from '@predictor/core';
import { Application, Router } from 'express';
import { auth } from 'express-openid-connect';

export type AuthConfiguration = {
  baseURL: string;
  clientID: string;
  issuerBaseURL: string;
  secret: string;
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
      ...config,
      authRequired: false,
      auth0Logout: true,
      routes: {
        login: '/auth/login',
        callback: '/auth/callback',
        logout: '/auth/logout',
        postLogoutRedirect: '/',
      },
    }),
  );

  return app.use('/', authRoute);
}
