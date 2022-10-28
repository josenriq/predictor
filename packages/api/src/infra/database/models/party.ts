import { Guard } from '@predictor/core';
import { Id, Mapper } from '@predictor/domain';
import { Party, PartyStorage } from '@predictor/domain/party';
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

const TABLE_NAME = 'Party';

export class PartyDbModel extends TimestampedDbModel {
  @prop({ required: true })
  public name: string;

  @prop({ required: true, index: true })
  public ownerId: string;

  @prop({ required: true, index: true, type: String })
  public memberIds: Array<string>;
}

type PartyDb = ReturnModelType<typeof PartyDbModel, {}>;

export function getPartyDb({ connection }: DatabaseConfig): PartyDb {
  Guard.require(connection, 'connection');
  return getModelForClass(PartyDbModel, {
    schemaOptions: { ...DEFAULT_SCHEMA_OPTIONS, collection: TABLE_NAME },
    existingConnection: connection,
  });
}

function createPartyMapper(
  db: PartyDb,
): Mapper<Party, DocumentType<PartyDbModel>> {
  return {
    from(model: PartyDbModel): Party {
      Guard.require(model, 'model');
      return new Party(
        Id.decode(model.id),
        model.name,
        Id.decode(model.ownerId),
        model.memberIds.map(Id.decode),
      );
    },

    to(party: Party): DocumentType<PartyDbModel> {
      Guard.require(party, 'party');
      return new db({
        id: Id.encode(party.id),
        name: party.name,
        ownerId: Id.encode(party.ownerId),
        memberIds: party.memberIds.map(Id.encode),
      });
    },
  };
}

export class PartyMongooseStorage
  extends MongooseStorage<Party, PartyDbModel>
  implements PartyStorage
{
  constructor(db: PartyDb) {
    super(db, createPartyMapper(db));
  }

  async delete(id: Id): Promise<void> {
    await this.db.deleteOne({ _id: Id.encode(id) }).exec();
  }

  async listByMember(memberId: Id): Promise<Party[]> {
    const records = await this.db
      .find({ memberIds: Id.encode(memberId) })
      .exec();
    return records.map(this.mapper.from);
  }
}
