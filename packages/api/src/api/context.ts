import { Request, Response } from 'express';
import { Id } from '@predictor/domain';
import { User } from '@predictor/domain/user';
import { TeamStorage } from '@predictor/domain/team';
import { MatchStorage } from '@predictor/domain/match';
import { PredictionStorage } from '@predictor/domain/prediction';
import { Database } from '@predictor/infra/database';

export interface Context {
  viewer?: User;
  teamStorage: TeamStorage;
  matchStorage: MatchStorage;
  predictionStorage: PredictionStorage;
}

export interface ContextParameters {
  req: Request;
  res: Response;
}
export async function createContext({
  req,
}: ContextParameters): Promise<Context> {
  const db = (req as any)['db'] as Database;
  return {
    // TODO: hard coding a user :)
    // viewer: (req as any)['user'],
    viewer: new User(Id.decode('123'), 'Jose Enrique'),
    teamStorage: db.team,
    matchStorage: db.match,
    predictionStorage: db.prediction,
  };
}
