import { Request, Response } from 'express';
import { deserializeUser } from './auth';
import { Maybe } from '@predictor/core';
import { User, UserStorage } from '@predictor/domain/user';
import { TeamStorage } from '@predictor/domain/team';
import { MatchStorage } from '@predictor/domain/match';
import { PredictionStorage } from '@predictor/domain/prediction';
import { Database } from '@predictor/infra/database';
import { TournamentEntryStorage } from '@predictor/domain/tournament-entry';
import { PartyStorage } from '@predictor/domain/party';

export interface Context {
  viewer: Maybe<User>;
  userStorage: UserStorage;
  teamStorage: TeamStorage;
  matchStorage: MatchStorage;
  predictionStorage: PredictionStorage;
  tournamentEntryStorage: TournamentEntryStorage;
  partyStorage: PartyStorage;
}

export interface ContextParameters {
  req: Request;
  res: Response;
}
export async function createContext({
  req,
}: ContextParameters): Promise<Context> {
  const db = (req as any)['db'] as Database;

  let viewer: Maybe<User>;
  if (req.oidc.isAuthenticated() && !!req.oidc.user) {
    const decodedUser = deserializeUser(req.oidc.user) ?? void 0;
    if (decodedUser) {
      viewer = await db.user.find(decodedUser.id);
    }
  }

  return {
    viewer,
    userStorage: db.user,
    teamStorage: db.team,
    matchStorage: db.match,
    predictionStorage: db.prediction,
    tournamentEntryStorage: db.tournamentEntry,
    partyStorage: db.party,
  };
}
