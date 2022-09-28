import { Guard } from '@predictor/core';
import { Id, Mapper } from '@predictor/domain';
import {
  Match,
  MatchLevel,
  MatchStatus,
  MatchStorage,
} from '@predictor/domain/match';
import { Score } from '@predictor/domain/score';
import {
  DbModel,
  DEFAULT_SCHEMA_OPTIONS,
  MongooseStorage,
} from '@predictor/infra/mongo';
import {
  DocumentType,
  getModelForClass,
  modelOptions,
  prop,
  ReturnModelType,
  Severity,
} from '@typegoose/typegoose';
import { DatabaseConfig } from '../config';
import { subMinutes } from 'date-fns';

const TABLE_NAME = 'Match';

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class MatchDbModel extends DbModel {
  @prop({ required: true })
  public tournamentId: string;

  @prop({ required: true })
  public homeTeamId: string;

  @prop({ required: true })
  public awayTeamId: string;

  @prop({ required: true, index: true })
  public startsAt: Date;

  @prop({ required: true, enum: MatchLevel })
  public level: MatchLevel;

  @prop({ enum: MatchStatus, default: MatchStatus.Unstarted })
  public status: MatchStatus;

  @prop()
  public score?: { home: number; away: number };

  @prop()
  public time?: string;
}

type MatchDb = ReturnModelType<typeof MatchDbModel, {}>;

export function getMatchDb({ connection }: DatabaseConfig): MatchDb {
  Guard.require(connection, 'connection');
  return getModelForClass(MatchDbModel, {
    schemaOptions: { ...DEFAULT_SCHEMA_OPTIONS, collection: TABLE_NAME },
    existingConnection: connection,
  });
}

function createMatchMapper(
  db: MatchDb,
): Mapper<Match, DocumentType<MatchDbModel>> {
  return {
    from(model: MatchDbModel): Match {
      Guard.require(model, 'model');
      return new Match(
        Id.decode(model.id),
        Id.decode(model.tournamentId),
        Id.decode(model.homeTeamId),
        Id.decode(model.awayTeamId),
        model.startsAt,
        model.level,
        model.status,
        model.score ? Score.decode(model.score) : void 0,
        model.time,
      );
    },

    to(match: Match): DocumentType<MatchDbModel> {
      Guard.require(match, 'match');
      return new db({
        id: Id.encode(match.id),
        tournamentId: Id.encode(match.tournamentId),
        homeTeamId: Id.encode(match.homeTeamId),
        awayTeamId: Id.encode(match.awayTeamId),
        startsAt: match.startsAt,
        level: match.level,
        status: match.status,
        score: match.score ? Score.encode(match.score) : void 0,
        time: match.time,
      });
    },
  };
}

export class MatchMongooseStorage
  extends MongooseStorage<Match, MatchDbModel>
  implements MatchStorage
{
  constructor(db: MatchDb) {
    super(db, createMatchMapper(db));
  }

  async listPendingByTournament(tournamentId: Id): Promise<Match[]> {
    const records = await this.db
      .find({
        tournamentId: Id.encode(tournamentId),
        startsAt: { $lt: subMinutes(new Date(), 2) },
        status: { $in: [MatchStatus.Unstarted, MatchStatus.Ongoing] },
      })
      .sort('startsAt')
      .exec();
    return records.map(record => {
      this.loader.prime(Id.encode(record.id), record);
      return this.mapper.from(record);
    });
  }
}
