import { readConfig } from '@predictor/config';
import { MatchChecker, MatchNotifier } from '@predictor/domain/match';
import { createDatabase, Database } from '@predictor/infra/database';
import { LiveChecker } from '@predictor/infra/match-checker';
import { PusherMatchNotifier } from '@predictor/infra/match-notifier';
import { connectToDatabase } from '@predictor/infra/mongo';

export type AppContext = {
  db: Database;
  checker: MatchChecker;
  notifier: MatchNotifier;
};

export async function bootstrap(): Promise<AppContext> {
  const config = readConfig();

  const connection = await connectToDatabase(config.storage.mongoUri);
  const db = createDatabase({ connection });

  const checker = new LiveChecker(db.team);

  const notifier = new PusherMatchNotifier(config.pusher);

  return { db, checker, notifier };
}
