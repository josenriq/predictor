import { Request, Response } from 'express';
import { Id, User } from '@predictor/domain';

export interface Context {
  viewer?: User;
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
  };
}
