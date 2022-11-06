import gql from 'graphql-tag';
import { Context } from '../context';
import { Maybe, None } from '@predictor/core';
import { SaveUserFlag, User } from '@predictor/domain/user';
import { AuthenticationRequired, Id } from '@predictor/domain';
import { FindTournamentEntry } from '@predictor/domain/tournament-entry';
import { QATAR_2022 } from '@predictor/domain/tournament';
import { ListJoinParties, Party } from '@predictor/domain/party';

export const UserTypeDef = gql`
  type User {
    id: ID!
    name: String!
    picture: Url
  }

  type SessionUser {
    id: ID!
    name: String!
    picture: Url
    hasSeenWelcome: Boolean!
    hasSeenTutorial: Boolean!
    points: Int!
    parties: [Party!]!
  }

  type Query {
    me: SessionUser
  }

  type Mutation {
    markHasSeenWelcome: SuccessOutput!
    markHasSeenTutorial: SuccessOutput!
  }
`;

export const UserResolver = {
  User: {},

  SessionUser: {
    hasSeenWelcome(user: User): boolean {
      return !!user.flags['hasSeenWelcome'];
    },

    hasSeenTutorial(user: User): boolean {
      return !!user.flags['hasSeenTutorial'];
    },

    // TODO: Reconsider moving this under Tournament someday
    async points(user: User, args: None, ctx: Context): Promise<number> {
      const query = new FindTournamentEntry(ctx.tournamentEntryStorage);
      const entry = await query.execute({
        userId: user.id,
        tournamentId: QATAR_2022,
      });
      return entry?.points ?? 0;
    },

    parties(user: User, args: None, ctx: Context): Promise<Array<Party>> {
      const query = new ListJoinParties(ctx.partyStorage);
      return query.execute(user.id);
    },
  },

  Query: {
    me(parent: None, args: None, ctx: Context): Maybe<User> {
      return ctx.viewer;
    },
  },

  Mutation: {
    async markHasSeenWelcome(
      parent: None,
      args: None,
      ctx: Context,
    ): Promise<{ success: boolean }> {
      if (!ctx.viewer) {
        throw new AuthenticationRequired();
      }

      const command = new SaveUserFlag(ctx.userStorage);

      await command.execute({
        userId: ctx.viewer?.id as Id,
        flag: 'hasSeenWelcome',
        value: true,
      });

      return { success: true };
    },

    async markHasSeenTutorial(
      parent: None,
      args: None,
      ctx: Context,
    ): Promise<{ success: boolean }> {
      if (!ctx.viewer) {
        throw new AuthenticationRequired();
      }

      const command = new SaveUserFlag(ctx.userStorage);

      await command.execute({
        userId: ctx.viewer?.id as Id,
        flag: 'hasSeenTutorial',
        value: true,
      });

      return { success: true };
    },
  },
};
