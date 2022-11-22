import { Guard, Maybe } from '@predictor/core';
import { emptyPage, Id, Page, PageInput, Query } from '@predictor/domain';
import { MatchNotFound, MatchStorage } from '@predictor/domain/match';
import { PartyNotFound, PartyStorage } from '@predictor/domain/party';
import { Prediction, PredictionStorage } from '../prediction';

export type ListPredictionsByPartyInput = PageInput & {
  matchId: Id;
  partyId: Id;
  excludedUserId: Maybe<Id>;
};

export class ListPredictionsByParty
  implements Query<ListPredictionsByPartyInput, Page<Prediction>>
{
  constructor(
    private readonly predictionStorage: PredictionStorage,
    private readonly matchStorage: MatchStorage,
    private readonly partyStorage: PartyStorage,
  ) {
    Guard.require(this.predictionStorage, 'predictionStorage');
    Guard.require(this.matchStorage, 'matchStorage');
    Guard.require(this.partyStorage, 'partyStorage');
  }

  async execute(input: ListPredictionsByPartyInput): Promise<Page<Prediction>> {
    Guard.require(input, 'input');

    const match = await this.matchStorage.find(input.matchId);
    if (!match) {
      throw new MatchNotFound(input.matchId);
    }
    if (match.isOpenForPredictions) {
      return emptyPage();
    }

    const party = await this.partyStorage.find(input.partyId);
    if (!party) {
      throw new PartyNotFound(input.partyId);
    }

    let userIds = party.memberIds;
    if (input.excludedUserId) {
      userIds = userIds.filter(id => !id.equals(input.excludedUserId));
    }

    return this.predictionStorage.listByMatch(
      match.id,
      userIds,
      input.pageSize,
      input.pageNumber,
    );
  }
}
