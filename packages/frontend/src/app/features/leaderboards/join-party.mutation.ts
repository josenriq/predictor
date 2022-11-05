import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { MutationOperation, JoinPartyInput, SuccessOutput } from 'app/graphql';

export type JoinPartyResult = {
  joinParty: SuccessOutput;
};

@Injectable({ providedIn: 'root' })
export class JoinPartyMutation extends MutationOperation<
  JoinPartyResult,
  { input: JoinPartyInput }
> {
  override mutation = gql`
    mutation JoinParty($input: JoinPartyInput!) {
      joinParty(input: $input) {
        success
      }
    }
  `;

  override refetchQueries = ['parties', 'rankings'];
}
