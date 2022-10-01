import convict from 'convict';
// @ts-ignore
import formats from 'convict-format-with-validator';
import { ApiConfiguration } from '@predictor/api';

convict.addFormats(formats);
convict.addFormat({
  name: 'secret',
  validate: val => {
    if (val && val !== '') return;
    throw new Error('secret is required');
  },
});

const config = convict<ApiConfiguration>({
  port: {
    doc: 'The port in which the application will be served',
    format: 'port',
    default: 4000,
    env: 'PORT',
  },
  auth: {
    baseURL: {
      doc: 'The application root url, e.g. http://localhost:4000',
      format: 'url',
      env: 'AUTH_BASE_URL',
      default: 'http://localhost:4000',
    },
    issuerBaseURL: {
      doc: 'Auth0 issuer base url',
      format: 'url',
      env: 'AUTH_ISSUER_BASE_URL',
      default: null,
    },
    clientID: {
      doc: 'Auth0 client ID',
      format: 'secret',
      env: 'AUTH_CLIENT_ID',
      default: null,
      sensitive: true,
    },
    clientSecret: {
      doc: 'Auth0 client secret',
      format: 'secret',
      env: 'AUTH_CLIENT_SECRET',
      default: null,
      sensitive: true,
    },
    cookieSecret: {
      doc: 'Secret to use with cookies',
      format: 'secret',
      env: 'AUTH_COOKIE_SECRET',
      default: null,
      sensitive: true,
    },
  },
  storage: {
    mongoUri: {
      doc: 'Connection string (uri) for the mongo database',
      format: 'secret',
      env: 'MONGO_URI',
      default: null,
      sensitive: true,
    },
  },
});

config.validate({ allowed: 'strict' });
export function readConfig(): ApiConfiguration {
  return config.get();
}
