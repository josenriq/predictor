import minimist from 'minimist';
import { Id } from '@predictor/domain';
import { GetMatch, MatchStatus, UpdateMatch } from '@predictor/domain/match';
import {
  GradePrediction,
  ListPredictionsByMatch,
  Prediction,
} from '@predictor/domain/prediction';
import { Guard } from '@predictor/core';
import { Score } from '@predictor/domain/score';
import { bootstrap } from './lambda/bootstrap';

(async () => {
  const { matchId, home, away, force } = minimist(process.argv.slice(2), {
    string: ['matchId'],
    boolean: ['force'],
  });
  try {
    Guard.require(matchId, 'matchId');
    Guard.integer(home, 'home');
    Guard.integer(away, 'away');
    Guard.greaterThanOrEqual(0, home, 'home');
    Guard.greaterThanOrEqual(0, away, 'away');
  } catch {
    console.log('Usage: --matchId 123 --home 2 --away 1');
  }

  const { db, notifier } = await bootstrap();

  // Get match
  const match = await new GetMatch(db.match).execute(Id.decode(matchId));
  const hasFinished = ![MatchStatus.Unstarted, MatchStatus.Ongoing].includes(
    match.status,
  );

  if (hasFinished && force !== true) {
    console.log(
      'Match has already been graded, ignoring. Optionally use --force to bypass this.',
    );
    return;
  }

  // Finish match
  await new UpdateMatch(db.match).execute({
    matchId: match.id,
    status: MatchStatus.Finished,
    score: Score.decode({ home, away }),
  });

  // Grade all predictions
  const gradePrediction = new GradePrediction(
    db.prediction,
    db.match,
    db.tournamentEntry,
  );

  let predictions: Prediction[];
  let pageNumber = 0;
  const pageSize = 100;
  do {
    predictions = await new ListPredictionsByMatch(db.prediction).execute({
      matchId: match.id,
      pageNumber,
      pageSize,
    });

    console.log(
      `Saving [${pageNumber * pageSize} - ${
        pageNumber * pageSize + predictions.length
      }] predictions`,
    );

    if (predictions.length) {
      await Promise.all(
        predictions.map(p => gradePrediction.execute({ predictionId: p.id })),
      );
    }

    pageNumber++;
  } while (predictions.length === pageSize);

  console.log('Notifying via Pusher');
  await notifier.notify(match);

  console.log('Finished :)');
})();
