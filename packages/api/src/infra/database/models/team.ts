import { Guard } from '@predictor/core';
import { Id, Mapper } from '@predictor/domain';
import { Team, TeamStorage } from '@predictor/domain/team';
import {
  DbModel,
  DEFAULT_SCHEMA_OPTIONS,
  MongooseStorage,
} from '@predictor/infra/mongo';
import {
  DocumentType,
  getModelForClass,
  prop,
  ReturnModelType,
} from '@typegoose/typegoose';
import { DatabaseConfig } from '../config';

const TABLE_NAME = 'Team';

export class TeamDbModel extends DbModel {
  @prop({ required: true })
  public name: string;
}

type TeamDb = ReturnModelType<typeof TeamDbModel, {}>;

export function getTeamDb({ connection }: DatabaseConfig): TeamDb {
  Guard.require(connection, 'connection');
  return getModelForClass(TeamDbModel, {
    schemaOptions: { ...DEFAULT_SCHEMA_OPTIONS, collection: TABLE_NAME },
    existingConnection: connection,
  });
}

function createTeamMapper(db: TeamDb): Mapper<Team, DocumentType<TeamDbModel>> {
  return {
    from(model: TeamDbModel): Team {
      Guard.require(model, 'model');
      return new Team(Id.decode(model.id), model.name);
    },

    to(team: Team): DocumentType<TeamDbModel> {
      Guard.require(team, 'team');
      return new db({
        id: Id.encode(team.id),
        name: team.name,
      });
    },
  };
}

export class TeamMongooseStorage
  extends MongooseStorage<Team, TeamDbModel>
  implements TeamStorage
{
  constructor(db: TeamDb) {
    super(db, createTeamMapper(db));
  }
}
