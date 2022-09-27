import { fetchMatches } from './scraper';

async function check(): Promise<void> {
  console.log('Loading matches');
  const matches = await fetchMatches();
  console.log(matches);
}

check();
