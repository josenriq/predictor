import { Id } from '@predictor/domain';
import {
  Match,
  MatchLevel,
  MatchStatus,
  MatchStorage,
} from '@predictor/domain/match';
import { Score } from '@predictor/domain/score';

const MATCHES = [
  {
    id: '123',
    homeTeamId: 'qat',
    awayTeamId: 'ecu',
    startsAt: new Date('2022-11-24 6:00'),
  },
];

export class MatchModel implements MatchStorage {
  async listByTournament(tournamentId: Id): Promise<Match[]> {
    return MATCHES.map(
      record =>
        new Match(
          Id.decode(record.id),
          Id.decode('qatar2022'),
          Id.decode(record.homeTeamId),
          Id.decode(record.awayTeamId),
          record.startsAt,
          MatchLevel.GroupStage,
          MatchStatus.Unstarted,
          Score.decode({ home: 2, away: 3 }),
        ),
    );
  }
}
