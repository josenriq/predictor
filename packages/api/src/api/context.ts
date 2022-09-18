import { Request, Response } from 'express';
import { Id } from '@predictor/domain';
import { User } from '@predictor/domain/user';
import { TeamStorage } from '@predictor/domain/team';
import { MatchStorage } from '@predictor/domain/match';

export interface Context {
  viewer?: User;
  teamStorage: TeamStorage;
  matchStorage: MatchStorage;
}

export interface ContextParameters {
  req: Request;
  res: Response;
}
export async function createContext({
  req,
}: ContextParameters): Promise<Context> {
  return {
    // TODO: hard coding a user :)
    // viewer: (req as any)['user'],
    viewer: new User(Id.decode('123'), 'Jose Enrique'),
    teamStorage: (req as any)['teamStorage'],
    matchStorage: (req as any)['matchStorage'],
  };
}
