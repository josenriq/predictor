import { Id } from '@predictor/domain';
import { Match, MatchNotifier } from '@predictor/domain/match';
import { QATAR_2022 } from '@predictor/domain/tournament';
import Pusher from 'pusher';

export type PusherConfig = {
  appId: string;
  key: string;
  secret: string;
  cluster: string;
};

export class PusherMatchNotifier implements MatchNotifier {
  private readonly pusher: Pusher;

  constructor(config: PusherConfig) {
    this.pusher = new Pusher({ useTLS: true, ...config });
  }

  async notify(match: Match): Promise<void> {
    await this.pusher.trigger(Id.encode(QATAR_2022), 'match-updated', {
      matchId: Id.encode(match.id),
    });
  }
}
