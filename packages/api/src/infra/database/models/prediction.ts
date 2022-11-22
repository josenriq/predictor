import { Guard, Maybe } from '@predictor/core';
import { Id, Mapper, Page } from '@predictor/domain';
import {
  Prediction,
  PredictionOutcome,
  PredictionStorage,
} from '@predictor/domain/prediction';
import { Score } from '@predictor/domain/score';
import {
  createMultiKeyDataLoader,
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

export class PredictionMongooseStorage
  extends MongooseStorage<Prediction, PredictionDbModel>
  implements PredictionStorage
{
  private readonly findByUserAndMatchLoader: DataLoader<
    string,
    Maybe<DocumentType<PredictionDbModel>>
  >;

  constructor(db: PredictionDb) {
    super(db, createPredictionMapper(db));

    this.findByUserAndMatchLoader = createMultiKeyDataLoader({
      db,
      keys: ['userId', 'matchId'],
    });
  }

  async save(prediction: Prediction): Promise<void> {
    await super.save(prediction);

    const compoundId = [
      Id.encode(prediction.userId),
      Id.encode(prediction.matchId),
    ].join(',');
    this.findByUserAndMatchLoader
      .clear(compoundId)
      .prime(compoundId, this.mapper.to(prediction));
  }

  async findByUserAndMatch(
    userId: Id,
    matchId: Id,
  ): Promise<Maybe<Prediction>> {
    const record = await this.findByUserAndMatchLoader.load(
      [Id.encode(userId), Id.encode(matchId)].join(','),
    );
    return record ? this.mapper.from(record) : void 0;
  }

  async listByMatch(
    matchId: Id,
    limitToUserIds: Array<Id>,
    pageSize: number,
    pageNumber: number,
  ): Promise<Page<Prediction>> {
    const filter: Record<string, any> = {
      matchId: Id.encode(matchId),
      userId: { $in: limitToUserIds.map(Id.encode) },
    };

    const total = await this.db.find(filter).countDocuments();

    const records = await this.db
      .find(filter)
      .skip(pageNumber * pageSize)
      .limit(pageSize);

    return {
      results: records.map(this.mapper.from),
      pageSize,
      pageNumber,
      hasMore: pageNumber * pageSize + records.length < total,
    };
  }
}
