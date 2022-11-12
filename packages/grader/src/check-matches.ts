import { bootstrap } from './lambda/bootstrap';
import { checkAndGradeMatches } from './lambda/handlers/check-matches';

(async () => {
  const ctx = await bootstrap();

  console.log(new Date(), 'Checking matches');
  await checkAndGradeMatches(ctx);
  setInterval(async () => {
    console.log(new Date(), 'Checking matches');
    await checkAndGradeMatches(ctx);
  }, 60 * 1000);
})();
