import { Injectable } from '@angular/core';
import { gql } from '@apollo/client/core';
import { QueryOperation, SessionUser } from 'app/graphql';

export type TutorialsQueryResult = {
  me: Pick<SessionUser, 'id' | 'hasSeenTutorial'>;
};

@Injectable({ providedIn: 'root' })
export class TutorialsQuery extends QueryOperation<TutorialsQueryResult> {
  override query = gql`
    query tutorials {
      me {
        id
        hasSeenTutorial
      }
    }
  `;
}
