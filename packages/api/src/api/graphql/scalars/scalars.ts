import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import './id';
import { DateResolver, DateTypeDef } from './date';

export const ScalarTypeDef = mergeTypeDefs([DateTypeDef]);

export const ScalarResolver = mergeResolvers([DateResolver]);
