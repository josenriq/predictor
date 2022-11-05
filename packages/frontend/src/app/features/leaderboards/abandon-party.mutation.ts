import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import {
  MutationOperation,
  AbandonPartyInput,
  SuccessOutput,
} from 'app/graphql';

export type AbandonPartyResult = {
  abandonParty: SuccessOutput;
};

@Injectable({ providedIn: 'root' })
export class AbandonPartyMutation extends MutationOperation<
  AbandonPartyResult,
  { input: AbandonPartyInput }
> {
  override mutation = gql`
    mutation AbandonParty($input: AbandonPartyInput!) {
      abandonParty(input: $input) {
        success
      }
    }
  `;

  override refetchQueries = ['parties'];
}
