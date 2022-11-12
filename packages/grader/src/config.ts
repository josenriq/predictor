import convict from 'convict';
// @ts-ignore
import formats from 'convict-format-with-validator';
import { PusherConfig } from './infra/match-notifier';

export type AppConfiguration = {
  storage: {
    mongoUri: string;
  };
  pusher: PusherConfig;
};

convict.addFormats(formats);
convict.addFormat({
  name: 'secret',
  validate: val => {
    if (val && val !== '') return;
    throw new Error('secret is required');
  },
});

const config = convict<AppConfiguration>({
  storage: {
    mongoUri: {
      doc: 'Connection string (uri) for the mongo database',
      format: 'secret',
      env: 'MONGO_URI',
      default: null,
      sensitive: true,
    },
  },
  pusher: {
    appId: {
      doc: 'The Pusher app id',
      format: 'secret',
      env: 'PUSHER_APP_ID',
      default: null,
      sensitive: true,
    },
    key: {
      doc: 'The Pusher app key',
      format: 'secret',
      env: 'PUSHER_KEY',
      default: null,
      sensitive: true,
    },
    secret: {
      doc: 'The Pusher app secret',
      format: 'secret',
      env: 'PUSHER_SECRET',
      default: null,
      sensitive: true,
    },
    cluster: {
      doc: 'The Pusher app cluster',
      format: String,
      env: 'PUSHER_CLUSTER',
      default: 'mt1',
    },
  },
});

config.validate({ allowed: 'strict' });
export function readConfig(): AppConfiguration {
  return config.get();
}
