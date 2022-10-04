import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { QueryOperation, User } from 'app/graphql';

export type SessionQueryResult = { me?: User };

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
