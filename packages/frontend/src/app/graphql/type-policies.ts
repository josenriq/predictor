import { TypePolicies } from '@apollo/client';
import { Maybe } from 'app/core';
import { RankingsPage } from './codegen';

export const typePolicies: TypePolicies = {
  Query: {
    fields: {
      rankings: {
        keyArgs: ['partyId'],
        merge(existing: Maybe<RankingsPage>, incoming: RankingsPage) {
          return {
            ...incoming,
            results: [...(existing?.results ?? []), ...incoming.results],
          };
        },
      },
    },
  },
};
