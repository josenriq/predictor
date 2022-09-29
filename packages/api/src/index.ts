import { readConfig } from './config';
import { bootstrap } from './api';

bootstrap(readConfig());
