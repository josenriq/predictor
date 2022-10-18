import { Injectable } from '@angular/core';
import { gql } from '@apollo/client/core';
import { QueryOperation, SessionUser } from 'app/graphql';

export type OnboardingQueryResult = {
  me: Pick<SessionUser, 'id' | 'hasSeenTutorial'>;
};

@Injectable({ providedIn: 'root' })
export class OnboardingQuery extends QueryOperation<OnboardingQueryResult> {
  override query = gql`
    query onboarding {
      me {
        id
        hasSeenTutorial
      }
    }
  `;
}
