import { Id, DomainError } from '@predictor/domain';

export class PredictionNotFound extends DomainError {
  static readonly code = 'prediction:not-found';

  constructor(public readonly predictionId: Id) {
    super(
      PredictionNotFound.code,
      `Prediction with id ${predictionId} not found.`,
    );
  }
}
