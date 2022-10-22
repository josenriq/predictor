import { readConfig } from './config';
import { bootstrap } from './api';
import http from 'http';

async function run(): Promise<void> {
  const config = readConfig();
  const app = await bootstrap(config);

  const httpServer = http.createServer(app);
  httpServer.listen({ port: config.port }, () =>
    console.log(
      `🚀 Predictor Api is running on http://localhost:${config.port}`,
    ),
  );
}

run();
