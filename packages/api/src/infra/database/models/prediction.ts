import { Guard, Maybe } from '@predictor/core';
import { Id, Mapper } from '@predictor/domain';
import {
  FindPredictionInput,
  Prediction,
  PredictionOutcome,
  PredictionStorage,
  SavePredictionInput,
} from '@predictor/domain/prediction';
import { Score } from '@predictor/domain/score';
import {
  createMultiKeyDataLoader,
  DEFAULT_SCHEMA_OPTIONS,
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
import DataLoader from 'dataloader';
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

export class PredictionMongooseStorage implements PredictionStorage {
  private readonly mapper: Mapper<Prediction, DocumentType<PredictionDbModel>>;
  private readonly findByUserAndMatchLoader: DataLoader<
    string,
    Maybe<DocumentType<PredictionDbModel>>
  >;

  constructor(private readonly db: PredictionDb) {
    Guard.require(db, 'db');
    this.mapper = createPredictionMapper(db);

    this.findByUserAndMatchLoader = createMultiKeyDataLoader({
      db,
      keys: ['userId', 'matchId'],
    });
  }

  async find({
    userId,
    matchId,
  }: FindPredictionInput): Promise<Maybe<Prediction>> {
    const record = await this.findByUserAndMatchLoader.load(
      [Id.encode(userId), Id.encode(matchId)].join(','),
    );
    return record ? this.mapper.from(record) : void 0;
  }

  async save(input: SavePredictionInput): Promise<Prediction> {
    const userId = Id.encode(input.userId);
    const matchId = Id.encode(input.matchId);
    const score = Score.encode(input.score);

    const existingRecord = await this.findByUserAndMatchLoader.load(
      [userId, matchId].join(','),
    );

    const record = existingRecord
      ? await this.db
          .findOneAndUpdate(
            { id: existingRecord.id },
            { $set: { score } },
            { new: true, upsert: false },
          )
          .exec()
      : await this.db.create({
          id: Id.encode(Id.generate()),
          userId,
          matchId,
          score,
        });

    if (!record) {
      // TODO: This should never occur. It needs a better message though.
      throw new Error('Unexpected error, prediction could not be saved');
    }

    return this.mapper.from(record);
  }
}
