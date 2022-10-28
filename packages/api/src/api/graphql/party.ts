import gql from 'graphql-tag';
import { Context } from '../context';
import { Guard, None } from '@predictor/core';
import { AuthenticationRequired, Id } from '@predictor/domain';
import {
  AbandonParty,
  CreateParty,
  JoinParty,
  Party,
} from '@predictor/domain/party';

export const PartyTypeDef = gql`
  type Party {
    id: ID!
    name: String!
  }

  input CreatePartyInput {
    name: String!
  }

  type CreatePartyOutput {
    party: Party!
  }

  input JoinPartyInput {
    partyId: ID!
  }

  input AbandonPartyInput {
    partyId: ID!
  }

  type Mutation {
    createParty(input: CreatePartyInput!): CreatePartyOutput!
    joinParty(input: JoinPartyInput!): SuccessOutput!
    abandonParty(input: AbandonPartyInput!): SuccessOutput!
  }
`;

export const PartyResolver = {
  Party: {},

  Mutation: {
    async createParty(
      parent: None,
      { input }: { input: { name: string } },
      ctx: Context,
    ): Promise<{ party: Party }> {
      Guard.require(input, 'input');

      if (!ctx.viewer) {
        throw new AuthenticationRequired();
      }

      const command = new CreateParty(ctx.partyStorage, ctx.userStorage);

      const party = await command.execute({
        name: input.name,
        ownerId: ctx.viewer?.id as Id,
      });
      return { party };
    },

    async joinParty(
      parent: None,
      { input }: { input: { partyId: Id } },
      ctx: Context,
    ): Promise<{ success: true }> {
      Guard.require(input, 'input');

      if (!ctx.viewer) {
        throw new AuthenticationRequired();
      }

      const command = new JoinParty(ctx.partyStorage, ctx.userStorage);

      await command.execute({
        partyId: input.partyId,
        userId: ctx.viewer?.id as Id,
      });

      return { success: true };
    },

    async abandonParty(
      parent: None,
      { input }: { input: { partyId: Id } },
      ctx: Context,
    ): Promise<{ success: true }> {
      Guard.require(input, 'input');

      if (!ctx.viewer) {
        throw new AuthenticationRequired();
      }

      const command = new AbandonParty(ctx.partyStorage);

      await command.execute({
        partyId: input.partyId,
        userId: ctx.viewer?.id as Id,
      });

      return { success: true };
    },
  },
};
