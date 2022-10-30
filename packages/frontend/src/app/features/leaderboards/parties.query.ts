import { Injectable } from '@angular/core';
import { gql } from '@apollo/client/core';
import { QueryOperation, SessionUser } from 'app/graphql';

export type PartiesQueryResult = {
  me?: Pick<SessionUser, 'id' | 'parties'>;
};

@Injectable({ providedIn: 'root' })
export class PartiesQuery extends QueryOperation<PartiesQueryResult> {
  override query = gql`
    query parties {
      me {
        id
        parties {
          id
          name
        }
      }
    }
  `;
}
