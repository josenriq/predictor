import { Guard } from '@predictor/core';
import { Match, MatchChecker, MatchStatus } from '@predictor/domain/match';
import { Score } from '@predictor/domain/score';
import { TeamStorage } from '@predictor/domain/team';
import { scrapeMatches } from './scraper';

export class LiveChecker implements MatchChecker {
  constructor(private readonly teamStorage: TeamStorage) {}

  async checkForUpdates(matches: Match[]): Promise<Match[]> {
    Guard.require(matches, 'matches');
    if (matches.length === 0) return [];

    const scrapedMatches = await scrapeMatches();

    const updatedMatches: Match[] = [];

    for (const match of matches) {
      const homeTeam = await this.teamStorage.find(match.homeTeamId);
      const awayTeam = await this.teamStorage.find(match.awayTeamId);

      Guard.require(homeTeam, 'homeTeam');
      Guard.require(awayTeam, 'awayTeam');

      for (const scrapedMatch of scrapedMatches) {
        if (
          homeTeam?.name === scrapedMatch.homeTeam &&
          awayTeam?.name === scrapedMatch.awayTeam
        ) {
          const scrapedScore = scrapedMatch.score
            ? Score.decode(scrapedMatch.score)
            : void 0;

          const statusChanged = match.status !== scrapedMatch.status;
          const scoreChanged = !match.score?.equals(scrapedScore);
          const timeChanged = match.time !== scrapedMatch.time;

          if (statusChanged || scoreChanged || timeChanged) {
            updatedMatches.push(
              match.withNewStatus(
                scrapedMatch.status as MatchStatus, // XXX: We can safely assume it's the same
                scrapedScore,
                scrapedMatch.time,
              ),
            );
          }
          break;
        }
      }
    }

    return updatedMatches;
  }
}
