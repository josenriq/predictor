import { prop, plugin } from '@typegoose/typegoose';
import { SchemaOptions } from 'mongoose';
import { timestamps } from './timestamps';

export abstract class DbModel {
  @prop({ alias: 'id' })
  public _id: string;
  public id: string;
}

@plugin(timestamps)
export abstract class TimestampedDbModel {
  @prop({ alias: 'id' })
  public _id: string;
  public id: string;

  @prop()
  public createdAt!: Date;

  @prop()
  public updatedAt!: Date;
}

export const DEFAULT_SCHEMA_OPTIONS: SchemaOptions = {
  versionKey: false,
};
