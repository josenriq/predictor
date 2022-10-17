import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { MutationOperation } from 'app/graphql';
import { SuccessOutput } from 'app/graphql';

export type MarkHasSeenTutorialResult = {
  markHasSeenTutorial: SuccessOutput;
};

@Injectable({ providedIn: 'root' })
export class MarkHasSeenTutorialMutation extends MutationOperation<MarkHasSeenTutorialResult> {
  override mutation = gql`
    mutation MarkHasSeenTutorial {
      markHasSeenTutorial {
        success
      }
    }
  `;

  override optimisticResponse = (): MarkHasSeenTutorialResult => ({
    markHasSeenTutorial: {
      __typename: 'SuccessOutput',
      success: true,
    } as SuccessOutput,
  });

  override refetchQueries = ['tutorials'];
}
