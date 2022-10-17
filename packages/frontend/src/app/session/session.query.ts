import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { QueryOperation, SessionUser } from 'app/graphql';

export type SessionQueryResult = { me?: SessionUser };

@Injectable({ providedIn: 'root' })
export class SessionQuery extends QueryOperation<SessionQueryResult> {
  override query = gql`
    query Session {
      me {
        id
        name
        picture
      }
    }
  `;
}
