import gql from 'graphql-tag';
import { Context } from '../context';
import { Maybe } from '@predictor/core';
import { Id, User } from '@predictor/domain';

export const UserTypeDef = gql`
  "An end-user of the app"
  type User {
    "The id of the user"
    id: ID!
    "The name of the user"
    name: String!
  }

  "Input to get a the details of a user"
  input GetUserInput {
    "The id of the user"
    userId: ID!
  }

  type Query {
    "Returns a user"
    user(input: GetUserInput!): User!
    "Returns the currently signed-in user"
    me: User
  }
`;

export const UserResolver = {
  User: {},

  Query: {
    async user(parent: unknown, args: unknown, ctx: Context): Promise<User> {
      const { input } = args as { input: { userId: Id } };
      // return getUserById(input.accountId)({
      //   viewer: ctx.viewer,
      //   userRepository: ctx.db.user,
      // });
      return new User(input.userId, 'Pepe');
    },

    me(parent: unknown, args: unknown, ctx: Context): Maybe<User> {
      return ctx.viewer;
    },
  },
};
