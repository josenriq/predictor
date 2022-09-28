import { Guard, Maybe } from '@predictor/core';
import { Id, Mapper } from '@predictor/domain';
import {
  Prediction,
  PredictionOutcome,
  PredictionStorage,
} from '@predictor/domain/prediction';
import { Score } from '@predictor/domain/score';
import {
  DEFAULT_SCHEMA_OPTIONS,
  MongooseStorage,
  TimestampedDbModel,
} from '@predictor/infra/mongo';
import {
  DocumentType,
  getModelForClass,
  index,
  modelOptions,
  prop,
  ReturnModelType,
  Severity,
} from '@typegoose/typegoose';
import { DatabaseConfig } from '../config';

const TABLE_NAME = 'Prediction';

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
@index({ userId: 1, matchId: 1 }, { unique: true })
export class PredictionDbModel extends TimestampedDbModel {
  @prop({ required: true, index: true })
  public userId: string;

  @prop({ required: true, index: true })
  public matchId: string;

  @prop({ required: true })
  public score: { home: number; away: number };

  @prop({ enum: PredictionOutcome })
  public outcome?: PredictionOutcome;

  @prop()
  public points?: number;
}

type PredictionDb = ReturnModelType<typeof PredictionDbModel, {}>;

export function getPredictionDb({ connection }: DatabaseConfig): PredictionDb {
  Guard.require(connection, 'connection');
  return getModelForClass(PredictionDbModel, {
    schemaOptions: { ...DEFAULT_SCHEMA_OPTIONS, collection: TABLE_NAME },
    existingConnection: connection,
  });
}

function createPredictionMapper(
  db: PredictionDb,
): Mapper<Prediction, DocumentType<PredictionDbModel>> {
  return {
    from(model: PredictionDbModel): Prediction {
      Guard.require(model, 'model');
      return new Prediction(
        Id.decode(model.id),
        Id.decode(model.userId),
        Id.decode(model.matchId),
        Score.decode(model.score),
        model.outcome,
        model.points,
      );
    },

    to(prediction: Prediction): DocumentType<PredictionDbModel> {
      Guard.require(prediction, 'prediction');
      return new db({
        id: Id.encode(prediction.id),
        userId: Id.encode(prediction.userId),
        matchId: Id.encode(prediction.matchId),
        score: Score.encode(prediction.score),
        outcome: prediction.outcome,
        points: prediction.points,
      });
    },
  };
}

export class PredictionMongooseStorage
  extends MongooseStorage<Prediction, PredictionDbModel>
  implements PredictionStorage
{
  constructor(db: PredictionDb) {
    super(db, createPredictionMapper(db));
  }

  async listByMatch(matchId: Id): Promise<Prediction[]> {
    const records = await this.db.find({ matchId: Id.encode(matchId) }).exec();
    return records.map(record => {
      this.loader.prime(Id.encode(record.id), record);
      return this.mapper.from(record);
    });
  }
}
