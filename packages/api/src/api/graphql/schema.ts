import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';

import { ScalarTypeDef, ScalarResolver } from './scalars';
import { UserTypeDef, UserResolver } from './user';

// import { RelayPaginationTypeDef } from './pagination';

export const typeDefs = mergeTypeDefs([
  ScalarTypeDef,
  UserTypeDef,
  // RelayPaginationTypeDef,
]);

export const resolvers = mergeResolvers([ScalarResolver as any, UserResolver]);
