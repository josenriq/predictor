import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { MutationOperation } from 'app/graphql';
import { SuccessOutput } from 'app/graphql';

export type MarkHasSeenWelcomeResult = {
  markHasSeenWelcome: SuccessOutput;
};

@Injectable({ providedIn: 'root' })
export class MarkHasSeenWelcomeMutation extends MutationOperation<MarkHasSeenWelcomeResult> {
  override mutation = gql`
    mutation MarkHasSeenWelcome {
      markHasSeenWelcome {
        success
      }
    }
  `;

  override optimisticResponse = (): MarkHasSeenWelcomeResult => ({
    markHasSeenWelcome: {
      __typename: 'SuccessOutput',
      success: true,
    } as SuccessOutput,
  });

  override refetchQueries = ['onboarding'];
}
