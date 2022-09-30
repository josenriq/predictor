import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import './id';
import { DateResolver, DateTypeDef } from './date';
import { UrlResolver, UrlTypeDef } from './url';
import { ScoreResolver, ScoreTypeDef } from './score';

export const ScalarTypeDef = mergeTypeDefs([
  DateTypeDef,
  UrlTypeDef,
  ScoreTypeDef,
]);

export const ScalarResolver = mergeResolvers([
  DateResolver,
  UrlResolver,
  ScoreResolver,
]);
