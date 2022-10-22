import { readConfig } from './config';
import { bootstrap } from './api';
import serverless from 'serverless-http';

export async function handler(event: Object, context: Object): Promise<Object> {
  const config = readConfig();
  const app = await bootstrap(config);

  return serverless(app)(event, context);
}
