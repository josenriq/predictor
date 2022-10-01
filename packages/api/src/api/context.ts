import { Request, Response } from 'express';
import { Id, Url } from '@predictor/domain';
import { User } from '@predictor/domain/user';
import { TeamStorage } from '@predictor/domain/team';
import { MatchStorage } from '@predictor/domain/match';
import { PredictionStorage } from '@predictor/domain/prediction';
import { Database } from '@predictor/infra/database';
import { TournamentEntryStorage } from '@predictor/domain/tournament-entry';
import { deserializeUser } from './auth';

export interface Context {
  viewer?: User;
  teamStorage: TeamStorage;
  matchStorage: MatchStorage;
  predictionStorage: PredictionStorage;
  tournamentEntryStorage: TournamentEntryStorage;
}

export interface ContextParameters {
  req: Request;
  res: Response;
}
export async function createContext({
  req,
}: ContextParameters): Promise<Context> {
  const db = (req as any)['db'] as Database;

  let viewer: User | undefined;
  if (req.oidc.isAuthenticated() && !!req.oidc.user) {
    viewer = deserializeUser(req.oidc.user) ?? void 0;
  }

  return {
    viewer,
    teamStorage: db.team,
    matchStorage: db.match,
    predictionStorage: db.prediction,
    tournamentEntryStorage: db.tournamentEntry,
  };
}
