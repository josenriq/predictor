import { Guard, Maybe } from '@predictor/core';
import { Id, Page, PageInput, Query } from '@predictor/domain';
import { PartyNotFound, PartyStorage } from '@predictor/domain/party';
import { TournamentEntry, TournamentEntryStorage } from '../tournament-entry';

export type ListRankingsInput = PageInput & {
  tournamentId: Id;
  partyId: Maybe<Id>;
};

export class ListRankings
  implements Query<ListRankingsInput, Page<TournamentEntry>>
{
  constructor(
    private readonly entryStorage: TournamentEntryStorage,
    private readonly partyStorage: PartyStorage,
  ) {
    Guard.require(this.entryStorage, 'entryStorage');
    Guard.require(this.partyStorage, 'partyStorage');
  }

  async execute(input: ListRankingsInput): Promise<Page<TournamentEntry>> {
    Guard.require(input, 'input');
    const { tournamentId, partyId, pageSize, pageNumber } = input;

    Guard.greaterThan(0, pageSize, 'pageSize');
    Guard.greaterThanOrEqual(0, pageNumber, 'pageNumber');

    let userIds: Maybe<Array<Id>>;
    if (partyId) {
      const party = await this.partyStorage.find(partyId);
      if (!party) {
        throw new PartyNotFound(partyId);
      }
      userIds = party.memberIds;
    }

    const results = await this.entryStorage.listOrderedByPoints(
      tournamentId,
      userIds,
      pageSize,
      pageNumber,
    );

    return {
      results,
      pageSize,
      pageNumber,
    };
  }
}
