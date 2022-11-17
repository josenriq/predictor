import chromium from 'chrome-aws-lambda';
import { Browser } from 'puppeteer-core';

export type ScrapedMatch = {
  homeTeam: string;
  awayTeam: string;
  status: 'Ongoing' | 'Finished' | 'Cancelled' | 'Postponed';
  score?: {
    home: number;
    away: number;
  };
  time?: string;
};

export async function scrapeMatches(): Promise<ScrapedMatch[]> {
  const browser = await makeBrowser();
  const page = await browser.newPage();

  await page.goto('https://www.soccer24.com/', {
    waitUntil: 'networkidle2',
  });

  const matches = await page.$$eval('.event__match', (matchEls: Element[]) => {
    const matches: ScrapedMatch[] = [];

    for (const matchEl of matchEls) {
      const homeTeam = matchEl
        .querySelector('.event__participant--home')
        ?.textContent?.trim();
      const awayTeam = matchEl
        .querySelector('.event__participant--away')
        ?.textContent?.trim();
      const homeScore = (
        matchEl.querySelector('.event__part--home.event__part--2') ??
        matchEl.querySelector('.event__score--home')
      )?.textContent?.trim();
      const awayScore = (
        matchEl.querySelector('.event__part--away.event__part--2') ??
        matchEl.querySelector('.event__score--away')
      )?.textContent?.trim();

      const homeScore2T = matchEl
        .querySelector('.event__part--home.event__part--2')
        ?.textContent?.trim();
      const awayScore2T = matchEl
        .querySelector('.event__part--away.event__part--2')
        ?.textContent?.trim();

      const stage = matchEl.querySelector('.event__stage')?.textContent?.trim();
      if (!homeTeam || !awayTeam || !homeScore || !awayScore || !stage)
        continue;

      const status =
        stage === 'Cancelled'
          ? 'Cancelled'
          : stage === 'Postponed'
          ? 'Postponed'
          : stage === 'Finished' || /After (Pen|ET)/i.test(stage)
          ? 'Finished'
          : 'Ongoing';

      const numberRegex = /^[0-9]+$/;

      const finalScore =
        numberRegex.test(homeScore) && numberRegex.test(awayScore)
          ? {
              home: parseInt(homeScore),
              away: parseInt(awayScore),
            }
          : void 0;
      const regularTimeScore =
        numberRegex.test(homeScore2T ?? '') &&
        numberRegex.test(awayScore2T ?? '')
          ? {
              home: parseInt(homeScore2T ?? '0'),
              away: parseInt(awayScore2T ?? '0'),
            }
          : void 0;
      const score = /After Pen/i.test(stage)
        ? regularTimeScore ?? finalScore
        : finalScore;

      matches.push({
        homeTeam,
        awayTeam,
        status,
        score,
        time: ['Ongoing', 'Finished'].includes(status)
          ? stage.replace(/^(.*\d+)$/, `$1'`).replace(/After.*/, 'Finished')
          : void 0,
      });
    }

    return matches;
  });

  await browser.close();

  return matches;
}

async function makeBrowser(): Promise<Browser> {
  const executablePath =
    (await chromium.executablePath) ??
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'; // TODO: Convert to env var

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });

  return browser;
}
