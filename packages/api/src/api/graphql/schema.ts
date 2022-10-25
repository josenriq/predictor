import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';

import { ScalarTypeDef, ScalarResolver } from './scalars';
import { UserTypeDef, UserResolver } from './user';
import { TeamTypeDef, TeamResolver } from './team';
import { MatchTypeDef, MatchResolver } from './match';
import { PredictionTypeDef, PredictionResolver } from './prediction';
import {
  TournamentEntryTypeDef,
  TournamentEntryResolver,
} from './tournament-entry';

// import { RelayPaginationTypeDef } from './pagination';

export const typeDefs = mergeTypeDefs([
  ScalarTypeDef,
  UserTypeDef,
  TeamTypeDef,
  MatchTypeDef,
  PredictionTypeDef,
  TournamentEntryTypeDef,
  // RelayPaginationTypeDef,
]);

export const resolvers = mergeResolvers([
  ScalarResolver,
  UserResolver,
  TeamResolver,
  MatchResolver,
  PredictionResolver,
  TournamentEntryResolver,
]);
