import { bootstrap } from './lambda/bootstrap';
import { checkAndGradeMatches } from './lambda/handlers/check-matches';

(async () => {
  const ctx = await bootstrap();
  await checkAndGradeMatches(ctx);
})();
