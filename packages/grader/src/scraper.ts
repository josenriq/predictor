import puppeteer from 'puppeteer';

export type Match = {
  homeTeam: string;
  awayTeam: string;
  status: 'Ongoing' | 'Finished' | 'Cancelled' | 'Postponed';
  homeScore?: number;
  awayScore?: number;
  time?: string;
};

export async function fetchMatches(): Promise<Match[]> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://www.soccer24.com/', {
    waitUntil: 'networkidle2',
  });

  const matches = await page.$$eval('.event__match', (matchEls: Element[]) => {
    const matches: Match[] = [];

    for (const matchEl of matchEls) {
      const homeTeam = matchEl
        .querySelector('.event__participant--home')
        ?.textContent?.trim();
      const awayTeam = matchEl
        .querySelector('.event__participant--away')
        ?.textContent?.trim();
      const homeScore = matchEl
        .querySelector('.event__score--home')
        ?.textContent?.trim();
      const awayScore = matchEl
        .querySelector('.event__score--away')
        ?.textContent?.trim();
      const stage = matchEl.querySelector('.event__stage')?.textContent?.trim();
      if (!homeTeam || !awayTeam || !homeScore || !awayScore || !stage)
        continue;

      const status =
        stage === 'Cancelled'
          ? 'Cancelled'
          : stage === 'Postponed'
          ? 'Postponed'
          : stage === 'Finished'
          ? 'Finished'
          : 'Ongoing';

      const numberRegex = /^[0-9]+$/;

      matches.push({
        homeTeam,
        awayTeam,
        status,
        homeScore: numberRegex.test(homeScore) ? parseInt(homeScore) : void 0,
        awayScore: numberRegex.test(awayScore) ? parseInt(awayScore) : void 0,
        time: ['Ongoing', 'Finished'].includes(status)
          ? stage
              .replace('Half Time', 'HT')
              .replace('Extra Time', 'ET')
              .replace('Finished', 'FT')
          : void 0,
      });
    }

    return matches;
  });

  await browser.close();

  return matches;
}
