import { Injectable } from '@angular/core';
import { gql } from '@apollo/client/core';
import { Party, QueryOperation } from 'app/graphql';

export type PartyQueryResult = {
  party: Party;
};

@Injectable({ providedIn: 'root' })
export class PartyQuery extends QueryOperation<
  PartyQueryResult,
  { partyId: string }
> {
  override query = gql`
    query party($partyId: ID!) {
      party(partyId: $partyId) {
        id
        name
      }
    }
  `;
}
