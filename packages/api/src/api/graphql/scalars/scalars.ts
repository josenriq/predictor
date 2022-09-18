import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import './id';
import { DateResolver, DateTypeDef } from './date';
import { ScoreResolver, ScoreTypeDef } from './score';

export const ScalarTypeDef = mergeTypeDefs([DateTypeDef, ScoreTypeDef]);

export const ScalarResolver = mergeResolvers([DateResolver, ScoreResolver]);
