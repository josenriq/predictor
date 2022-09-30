import gql from 'graphql-tag';
import { Context } from '../context';
import { Maybe } from '@predictor/core';
import { User } from '@predictor/domain/user';

export const UserTypeDef = gql`
  type User {
    id: ID!
    name: String!
    picture: Url
  }

  type Query {
    me: User
  }
`;

export const UserResolver = {
  User: {},

  Query: {
    // async user(parent: unknown, args: unknown, ctx: Context): Promise<User> {
    //   const { input } = args as { input: { userId: Id } };
    //   // return getUserById(input.accountId)({
    //   //   viewer: ctx.viewer,
    //   //   userRepository: ctx.db.user,
    //   // });
    //   return new User(input.userId, 'Pepe');
    // },

    me(parent: unknown, args: unknown, ctx: Context): Maybe<User> {
      return ctx.viewer;
    },
  },
};
