import { TypePolicies } from '@apollo/client';
import { Maybe } from 'app/core';
import { PredictionsPage, RankingsPage } from './codegen';

export const typePolicies: TypePolicies = {
  Query: {
    fields: {
      rankings: {
        keyArgs: ['input', ['partyId']],
        merge(existing: Maybe<RankingsPage>, incoming: RankingsPage) {
          return {
            ...incoming,
            results: [...(existing?.results ?? []), ...incoming.results],
          };
        },
      },
    },
  },
  Match: {
    fields: {
      partyPredictions: {
        keyArgs: ['input', ['partyId']],
        merge(existing: Maybe<PredictionsPage>, incoming: PredictionsPage) {
          return {
            ...incoming,
            results: [...(existing?.results ?? []), ...incoming.results],
          };
        },
      },
    },
  },
};
