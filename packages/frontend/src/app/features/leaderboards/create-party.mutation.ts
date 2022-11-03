import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import {
  MutationOperation,
  CreatePartyInput,
  CreatePartyOutput,
} from 'app/graphql';

export type CreatePartyResult = {
  createParty: CreatePartyOutput;
};

@Injectable({ providedIn: 'root' })
export class CreatePartyMutation extends MutationOperation<
  CreatePartyResult,
  { input: CreatePartyInput }
> {
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
}
