import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import {
  MutationOperation,
  CreatePartyInput,
  CreatePartyOutput,
} from 'app/graphql';
import { PartiesQuery } from './parties.query';

export type CreatePartyResult = {
  createParty: CreatePartyOutput;
};

@Injectable({ providedIn: 'root' })
export class CreatePartyMutation extends MutationOperation<
  CreatePartyResult,
  { input: CreatePartyInput }
> {
  constructor(apollo: Apollo, private partiesQuery: PartiesQuery) {
    super(apollo);
  }

  override mutation = gql`
    mutation CreateParty($input: CreatePartyInput!) {
      createParty(input: $input) {
        party {
          id
          name
        }
      }
    }
  `;

  override refetchQueries = [this.partiesQuery.query];
  override awaitRefetchQueries = true;
}
