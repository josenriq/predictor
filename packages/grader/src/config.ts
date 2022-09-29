import convict from 'convict';
// @ts-ignore
import formats from 'convict-format-with-validator';

export type AppConfiguration = {
  storage: {
    mongoUri: string;
  };
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
});

config.validate({ allowed: 'strict' });
export function readConfig(): AppConfiguration {
  return config.get();
}
