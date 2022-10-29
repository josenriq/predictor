import { Guard, Maybe } from '@predictor/core';
import { Id, Mapper, Page } from '@predictor/domain';
import {
  TournamentEntry,
  TournamentEntryStorage,
} from '@predictor/domain/tournament-entry';
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
  prop,
  ReturnModelType,
} from '@typegoose/typegoose';
import DataLoader from 'dataloader';
import { DatabaseConfig } from '../config';

const TABLE_NAME = 'TournamentEntry';

@index({ userId: 1, tournamentId: 1 }, { unique: true })
@index({ userId: 1, tournamentId: 1, points: -1 })
export class TournamentEntryDbModel extends TimestampedDbModel {
  @prop({ required: true, index: true })
  public userId: string;

  @prop({ required: true, index: true })
  public tournamentId: string;

  @prop({ default: 0, index: true })
  public points: number;
}

type TournamentEntryDb = ReturnModelType<typeof TournamentEntryDbModel, {}>;

export function getTournamentEntryDb({
  connection,
}: DatabaseConfig): TournamentEntryDb {
  Guard.require(connection, 'connection');
  return getModelForClass(TournamentEntryDbModel, {
    schemaOptions: { ...DEFAULT_SCHEMA_OPTIONS, collection: TABLE_NAME },
    existingConnection: connection,
  });
}

function createTournamentEntryMapper(
  db: TournamentEntryDb,
): Mapper<TournamentEntry, DocumentType<TournamentEntryDbModel>> {
  return {
    from(model: TournamentEntryDbModel): TournamentEntry {
      Guard.require(model, 'model');
      return new TournamentEntry(
        Id.decode(model.id),
        Id.decode(model.userId),
        Id.decode(model.tournamentId),
        model.points,
      );
    },

    to(entry: TournamentEntry): DocumentType<TournamentEntryDbModel> {
      Guard.require(entry, 'entry');
      return new db({
        id: Id.encode(entry.id),
        userId: Id.encode(entry.userId),
        tournamentId: Id.encode(entry.tournamentId),
        points: entry.points,
      });
    },
  };
}

export class TournamentEntryMongooseStorage
  extends MongooseStorage<TournamentEntry, TournamentEntryDbModel>
  implements TournamentEntryStorage
{
  private readonly findByUserAndTournamentLoader: DataLoader<
    string,
    Maybe<DocumentType<TournamentEntryDbModel>>
  >;

  constructor(db: TournamentEntryDb) {
    super(db, createTournamentEntryMapper(db));

    this.findByUserAndTournamentLoader = createMultiKeyDataLoader({
      db,
      keys: ['userId', 'tournamentId'],
    });
  }

  async findByUserAndTournament(
    userId: Id,
    tournamentId: Id,
  ): Promise<Maybe<TournamentEntry>> {
    const record = await this.findByUserAndTournamentLoader.load(
      [Id.encode(userId), Id.encode(tournamentId)].join(','),
    );
    return record ? this.mapper.from(record) : void 0;
  }

  async listOrderedByPoints(
    tournamentId: Id,
    limitToUserIds: Maybe<Array<Id>>,
    pageSize: number,
    pageNumber: number,
  ): Promise<Page<TournamentEntry>> {
    const filter: Record<string, any> = {
      tournamentId: Id.encode(tournamentId),
    };
    if (limitToUserIds) {
      filter['userId'] = { $in: limitToUserIds.map(Id.encode) };
    }

    const total = await this.db.find(filter).countDocuments();

    const records = await this.db
      .find(filter)
      .sort('-points')
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
