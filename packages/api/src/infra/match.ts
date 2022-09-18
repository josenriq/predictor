import { Id } from '@predictor/domain';
import {
  Match,
  MatchLevel,
  MatchStatus,
  MatchStorage,
} from '@predictor/domain/match';
import { Score } from '@predictor/domain/score';

]export class MatchModel implements MatchStorage {
  async listByTournament(tournamentId: Id): Promise<Match[]> {
    return [];
  }
}
