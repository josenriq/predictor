import { DatabaseConfig } from './config';
import { MatchStorage } from '@predictor/domain/match';
import { TeamStorage } from '@predictor/domain/team';
import { PredictionStorage } from '@predictor/domain/prediction';
import {
  getMatchDb,
  MatchMongooseStorage,
  getTeamDb,
  TeamMongooseStorage,
  PredictionMongooseStorage,
  getPredictionDb,
} from './models';

export type Database = {
  team: TeamStorage;
  match: MatchStorage;
  prediction: PredictionStorage;
};

export function createDatabase(config: DatabaseConfig): Database {
  return {
    team: new TeamMongooseStorage(getTeamDb(config)),
    match: new MatchMongooseStorage(getMatchDb(config)),
    prediction: new PredictionMongooseStorage(getPredictionDb(config)),
  };
}
