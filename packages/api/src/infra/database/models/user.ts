import { Guard } from '@predictor/core';
import { Id, Url, Mapper } from '@predictor/domain';
import { User, UserStorage } from '@predictor/domain/user';
import {
  DEFAULT_SCHEMA_OPTIONS,
  MongooseStorage,
  TimestampedDbModel,
} from '@predictor/infra/mongo';
import {
  DocumentType,
  getModelForClass,
  prop,
  ReturnModelType,
} from '@typegoose/typegoose';
import { DatabaseConfig } from '../config';

const TABLE_NAME = 'User';

export class UserDbModel extends TimestampedDbModel {
  @prop({ required: true })
  public name: string;

  @prop()
  public picture?: string;
}

type UserDb = ReturnModelType<typeof UserDbModel, {}>;

export function getUserDb({ connection }: DatabaseConfig): UserDb {
  Guard.require(connection, 'connection');
  return getModelForClass(UserDbModel, {
    schemaOptions: { ...DEFAULT_SCHEMA_OPTIONS, collection: TABLE_NAME },
    existingConnection: connection,
  });
}

function createUserMapper(db: UserDb): Mapper<User, DocumentType<UserDbModel>> {
  return {
    from(model: UserDbModel): User {
      Guard.require(model, 'model');
      return new User(
        Id.decode(model.id),
        model.name,
        model.picture ? Url.decode(model.picture) : void 0,
      );
    },

    to(user: User): DocumentType<UserDbModel> {
      Guard.require(user, 'user');
      return new db({
        id: Id.encode(user.id),
        name: user.name,
        picture: user.picture ? Url.encode(user.picture) : void 0,
      });
    },
  };
}

export class UserMongooseStorage
  extends MongooseStorage<User, UserDbModel>
  implements UserStorage
{
  constructor(db: UserDb) {
    super(db, createUserMapper(db));
  }
}
