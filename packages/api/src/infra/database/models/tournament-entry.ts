import { Guard, Maybe } from '@predictor/core';
import { Id, Mapper } from '@predictor/domain';
import {
  FindTournamentEntryInput,
  CreateTournamentEntryInput,
  TournamentEntry,
  TournamentEntryStorage,
} from '@predictor/domain/tournament-entry';
import {
  createMultiKeyDataLoader,
  DEFAULT_SCHEMA_OPTIONS,
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

export class TournamentEntryMongooseStorage implements TournamentEntryStorage {
  private readonly mapper: Mapper<
    TournamentEntry,
    DocumentType<TournamentEntryDbModel>
  >;
  private readonly findByUserAndTournamentLoader: DataLoader<
    string,
    Maybe<DocumentType<TournamentEntryDbModel>>
  >;

  constructor(private readonly db: TournamentEntryDb) {
    Guard.require(db, 'db');
    this.mapper = createTournamentEntryMapper(db);

    this.findByUserAndTournamentLoader = createMultiKeyDataLoader({
      db,
      keys: ['userId', 'tournamentId'],
    });
  }

  async find({
    userId,
    tournamentId,
  }: FindTournamentEntryInput): Promise<Maybe<TournamentEntry>> {
    const record = await this.findByUserAndTournamentLoader.load(
      [Id.encode(userId), Id.encode(tournamentId)].join(','),
    );
    return record ? this.mapper.from(record) : void 0;
  }

  async create(input: CreateTournamentEntryInput): Promise<TournamentEntry> {
    const record = await this.db.create({
      id: Id.encode(Id.generate()),
      userId: Id.encode(input.userId),
      tournamentId: Id.encode(input.tournamentId),
      points: 0,
    });
    return this.mapper.from(record);
  }
}
