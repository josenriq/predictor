import { Guard } from '@predictor/core';
import { Id, Command } from '@predictor/domain';
import { Score } from '@predictor/domain/score';
import { MatchStatus, MatchStorage } from '../match';
import { MatchNotFound } from '../errors';

export type UpdateMatchCommandInput = {
  matchId: Id;
  status: MatchStatus;
  score?: Score;
  time?: string;
};

export class UpdateMatch implements Command<UpdateMatchCommandInput> {
  constructor(
    private readonly matchStorage: MatchStorage, // pusher repository
  ) {
    Guard.require(this.matchStorage, 'matchStorage');
  }

  async execute(input: UpdateMatchCommandInput): Promise<void> {
    Guard.require(input, 'input');

    const match = await this.matchStorage.find(input.matchId);
    if (!match) {
      throw new MatchNotFound(input.matchId);
    }

    const updatedMatch = match.withNewStatus(
      input.status,
      input.score,
      input.time,
    );
    await this.matchStorage.save(updatedMatch);

    // TODO: Use pusher to notify
  }
}
