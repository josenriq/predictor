import { DatabaseConfig } from './config';
import { MatchStorage } from '@predictor/domain/match';
import { TeamStorage } from '@predictor/domain/team';
import { PredictionStorage } from '@predictor/domain/prediction';
import { TournamentEntryStorage } from '@predictor/domain/tournament-entry';
import { UserStorage } from '@predictor/domain/user';
import { PartyStorage } from '@predictor/domain/party';
import {
  getMatchDb,
  MatchMongooseStorage,
  getTeamDb,
  TeamMongooseStorage,
  PredictionMongooseStorage,
  getPredictionDb,
  getTournamentEntryDb,
  TournamentEntryMongooseStorage,
  UserMongooseStorage,
  getUserDb,
  PartyMongooseStorage,
  getPartyDb,
} from './models';

export type Database = {
  user: UserStorage;
  team: TeamStorage;
  match: MatchStorage;
  prediction: PredictionStorage;
  tournamentEntry: TournamentEntryStorage;
  party: PartyStorage;
};

export function createDatabase(config: DatabaseConfig): Database {
  return {
    user: new UserMongooseStorage(getUserDb(config)),
    team: new TeamMongooseStorage(getTeamDb(config)),
    match: new MatchMongooseStorage(getMatchDb(config)),
    tournamentEntry: new TournamentEntryMongooseStorage(
      getTournamentEntryDb(config),
    ),
    prediction: new PredictionMongooseStorage(getPredictionDb(config)),
    party: new PartyMongooseStorage(getPartyDb(config)),
  };
}
