import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import './id';
import { DateResolver, DateTypeDef } from './date';
import { UrlResolver, UrlTypeDef } from './url';
import { ScoreResolver, ScoreTypeDef } from './score';
import { JSONResolver, JSONTypeDef } from './json';

export const ScalarTypeDef = mergeTypeDefs([
  DateTypeDef,
  UrlTypeDef,
  ScoreTypeDef,
  JSONTypeDef,
]);

export const ScalarResolver = mergeResolvers([
  DateResolver,
  UrlResolver,
  ScoreResolver,
  JSONResolver,
]);
