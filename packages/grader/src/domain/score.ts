import { Guard, Maybe } from '@predictor/core';

export enum ScoreOutcome {
  HomeWins = 'HomeWins',
  AwayWins = 'AwayWins',
  Tie = 'Tie',
}

export class Score {
  private constructor(
    public readonly home: number,
    public readonly away: number,
  ) {
    Guard.between(0, 100, this.home, 'home');
    Guard.between(0, 100, this.away, 'away');
  }

  get outcome(): ScoreOutcome {
    return this.home > this.away
      ? ScoreOutcome.HomeWins
      : this.home < this.away
      ? ScoreOutcome.AwayWins
      : ScoreOutcome.Tie;
  }

  equals(other: Maybe<Score>): boolean {
    if (other == null) return false;
    if (other === this) return true;
    return this.home === other.home && this.away === other.away;
  }

  static decode(value: { home: number; away: number }): Score {
    Guard.require(value, 'value');
    return new Score(value.home, value.away);
  }

  static encode(score: Score): { home: number; away: number } {
    Guard.require(score, 'score');
    return { home: score.home, away: score.away };
  }
}
