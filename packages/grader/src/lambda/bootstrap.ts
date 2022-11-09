import { readConfig } from '@predictor/config';
import { MatchChecker, MatchNotifier } from '@predictor/domain/match';
import { createDatabase, Database } from '@predictor/infra/database';
import { LiveChecker } from '@predictor/infra/match-checker';
import { connectToDatabase } from '@predictor/infra/mongo';

export type AppContext = {
  db: Database;
  checker: MatchChecker;
  // notifier: MatchNotifier; TODO: Pusher
};

export async function bootstrap(): Promise<AppContext> {
  const config = readConfig();

  const connection = await connectToDatabase(config.storage.mongoUri);
  const db = createDatabase({ connection });

  const checker = new LiveChecker(db.team);

  return { db, checker };
}
