import convict from 'convict';
// @ts-ignore
import formats from 'convict-format-with-validator';
// import { ApiConfiguration } from '@monthly/api';

convict.addFormats(formats);
convict.addFormat({
  name: 'secret',
  validate: val => {
    if (val && val !== '') return;
    throw new Error('secret is required');
  },
});

export type ApiConfiguration = {
  port: number;
  redis: {
    uri: string;
  };
};

const config = convict<ApiConfiguration>({
  port: {
    doc: 'The port in which the application will be served',
    format: 'port',
    default: 4000,
    env: 'PORT',
  },
  redis: {
    uri: {
      doc: 'Connection string (uri) for the redis database',
      format: 'secret',
      env: 'REDIS_URI',
      default: null,
      sensitive: true,
    },
  },
});

config.validate({ allowed: 'strict' });
export function read(): ApiConfiguration {
  return config.get();
}
