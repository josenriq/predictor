import hpp from 'hpp';
import helmet, { HelmetOptions } from 'helmet';
import cors from 'cors';
import { Application } from 'express';

interface SecurityOptions {
  hpp?: hpp.Options;
  helmet?: HelmetOptions;
  trustProxy?: boolean;
  cors?: cors.CorsOptions;
}

function withDefaultOptions(options?: SecurityOptions): SecurityOptions {
  return Object.assign({}, { trustProxy: true }, options ?? {});
}

export function secure(
  server: Application,
  options?: SecurityOptions,
): Application {
  const config = withDefaultOptions(options);
  return server
    .set('trust proxy', config.trustProxy)
    .use(hpp(config.hpp))
    .use(helmet(config.helmet))
    .use(cors(config.cors));
}
