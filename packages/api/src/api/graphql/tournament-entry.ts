import { TournamentEntry } from '@predictor/domain/tournament-entry';
import { User } from '@predictor/domain/user';
import { GetUser } from '@predictor/domain/user/queries';
import gql from 'graphql-tag';
import { Context } from '../context';

export const TournamentEntryTypeDef = gql`
  type TournamentEntry {
    id: ID!
    user: User!
    points: Int!
  }
`;

export const TournamentEntryResolver = {
  TournamentEntry: {
    user(entry: TournamentEntry, args: unknown, ctx: Context): Promise<User> {
      const query = new GetUser(ctx.userStorage);
      return query.execute(entry.userId);
    },
  },
};
