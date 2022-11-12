import { makeResponse, Response } from '@predictor/core';
import {
  ListPendingMatches,
  Match,
  MatchStatus,
  UpdateMatch,
} from '@predictor/domain/match';
import {
  GradePrediction,
  ListPredictionsByMatch,
  Prediction,
} from '@predictor/domain/prediction';
import { QATAR_2022 } from '@predictor/domain/tournament';
import { AppContext, bootstrap } from '../bootstrap';

export async function checkAndGradeMatches(ctx: AppContext): Promise<void> {
  console.log(`Fetching pending matches from DB`);
  const listPending = new ListPendingMatches(ctx.db.match);
  const pendingMatches = await listPending.execute(QATAR_2022);

  if (pendingMatches.length === 0) {
    console.log(`No pending matches`);
    return;
  }

  console.log(`Checking for updates on ${pendingMatches.length} match(es)`);
  const updatedMatches = await ctx.checker.checkForUpdates(pendingMatches);
  if (updatedMatches.length === 0) {
    console.log(`Nothing to update`);
    return;
  }

  console.log(`Updating ${updatedMatches.length} match(es)`);
  for (const match of updatedMatches) {
    await updateMatch(match, ctx);
  }

  console.log('Finished!');
}

async function updateMatch(match: Match, ctx: AppContext): Promise<void> {
  console.log(`Updating match ${match.id}`);

  await new UpdateMatch(ctx.db.match, ctx.notifier).execute({
    matchId: match.id,
    status: match.status,
    score: match.score,
    time: match.time,
  });

  if (match.status !== MatchStatus.Finished) return;

  console.log(`Match has finished, grading all predictions.`);
  const listPredictions = new ListPredictionsByMatch(ctx.db.prediction);
  const gradePrediction = new GradePrediction(
    ctx.db.prediction,
    ctx.db.match,
    ctx.db.tournamentEntry,
  );

  let predictions: Prediction[];
  let pageNumber = 0;
  const pageSize = 100;
  do {
    predictions = await listPredictions.execute({
      matchId: match.id,
      pageNumber,
      pageSize,
    });

    if (predictions.length) {
      console.log(
        `Saving [${pageNumber * pageSize} - ${predictions.length}] predictions`,
      );
      await Promise.all(
        predictions.map(p => gradePrediction.execute({ predictionId: p.id })),
      );
    }

    pageNumber++;
  } while (predictions.length === pageSize);
}

export async function handler(event: unknown, context: any): Promise<Response> {
  context.callbackWaitsForEmptyEventLoop = false;

  const ctx = await bootstrap();

  await checkAndGradeMatches(ctx);

  return makeResponse();
}
