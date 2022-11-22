import { Guard, Maybe, None } from '@predictor/core';
import { Id, Page, PageInput } from '@predictor/domain';
import { QATAR_2022 } from '@predictor/domain/tournament';
import {
  ListRankings,
  TournamentEntry,
} from '@predictor/domain/tournament-entry';
import { GetUser, User } from '@predictor/domain/user';
import gql from 'graphql-tag';
import { Context } from '../context';

export const TournamentEntryTypeDef = gql`
  type TournamentEntry {
    id: ID!
    user: User!
    points: Int!
  }

  input ListRankingsInput {
    pageSize: Int = 20
    pageNumber: Int = 0
    partyId: ID
  }

  type RankingsPage {
    results: [TournamentEntry!]!
    pageSize: Int!
    pageNumber: Int!
    hasMore: Boolean!
  }

  type Query {
    rankings(input: ListRankingsInput!): RankingsPage!
  }
`;

export const TournamentEntryResolver = {
  TournamentEntry: {
    user(entry: TournamentEntry, args: None, ctx: Context): Promise<User> {
      const query = new GetUser(ctx.userStorage);
      return query.execute(entry.userId);
    },
  },

  Query: {
    rankings(
      parent: None,
      { input }: { input: PageInput & { partyId: Maybe<Id> } },
      ctx: Context,
    ): Promise<Page<TournamentEntry>> {
      Guard.require(input, 'input');

      const query = new ListRankings(
        ctx.tournamentEntryStorage,
        ctx.partyStorage,
      );
      return query.execute({ ...input, tournamentId: QATAR_2022 });
    },
  },
};
