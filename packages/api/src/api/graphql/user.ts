import gql from 'graphql-tag';
import { Context } from '../context';
import { Maybe } from '@predictor/core';
import { SaveUserFlag, User } from '@predictor/domain/user';
import { AuthenticationRequired, Id } from '@predictor/domain';
import { FindTournamentEntry } from '@predictor/domain/tournament-entry';
import { QATAR_2022 } from '@predictor/domain/tournament';

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
    hasSeenTutorial: Boolean!
    points: Int!
  }

  type SuccessOutput {
    success: Boolean!
  }

  type Query {
    me: SessionUser
  }

  type Mutation {
    markHasSeenTutorial: SuccessOutput
  }
`;

export const UserResolver = {
  User: {},

  SessionUser: {
    hasSeenTutorial(user: User): boolean {
      return !!user.flags['hasSeenTutorial'];
    },

    // TODO: Reconsider moving this under Tournament
    async points(user: User, args: unknown, ctx: Context): Promise<number> {
      const query = new FindTournamentEntry(ctx.tournamentEntryStorage);
      const entry = await query.execute({
        userId: user.id,
        tournamentId: QATAR_2022,
      });
      return entry?.points ?? 0;
    },
  },

  Query: {
    me(parent: unknown, args: unknown, ctx: Context): Maybe<User> {
      return ctx.viewer;
    },
  },

  Mutation: {
    async markHasSeenTutorial(
      parent: unknown,
      args: unknown,
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
