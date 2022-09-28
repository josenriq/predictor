import { DatabaseConfig } from './config';
import { MatchStorage } from '@predictor/domain/match';
import { TeamStorage } from '@predictor/domain/team';
import { PredictionStorage } from '@predictor/domain/prediction';
import { TournamentEntryStorage } from '@predictor/domain/tournament-entry';
import {
  getMatchDb,
  MatchMongooseStorage,
  getTeamDb,
  TeamMongooseStorage,
  PredictionMongooseStorage,
  getPredictionDb,
  getTournamentEntryDb,
  TournamentEntryMongooseStorage,
} from './models';

export type Database = {
  team: TeamStorage;
  match: MatchStorage;
  prediction: PredictionStorage;
  tournamentEntry: TournamentEntryStorage;
};

export function createDatabase(config: DatabaseConfig): Database {
  return {
    team: new TeamMongooseStorage(getTeamDb(config)),
    match: new MatchMongooseStorage(getMatchDb(config)),
    tournamentEntry: new TournamentEntryMongooseStorage(
      getTournamentEntryDb(config),
    ),
    prediction: new PredictionMongooseStorage(getPredictionDb(config)),
  };
}
