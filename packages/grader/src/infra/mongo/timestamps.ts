import { Schema } from 'mongoose';
import { Guard } from '@predictor/core';

const defaults = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export function timestamps(
  schema: Schema,
  options?: { createdAt?: string; updatedAt?: string },
): void {
  Guard.require(schema, 'schema');

  const { createdAt, updatedAt } = Object.assign({}, defaults, options);

  function onSave(this: any, next: () => void): void {
    const timestamp = new Date();

    if (createdAt && !this[createdAt]) {
      this[createdAt] = timestamp;
    }
    if (updatedAt) {
      this[updatedAt] = timestamp;
    }

    next();
  }

  function onUpdate(this: any, next: () => void): void {
    const timestamp = new Date();

    const update = this.getUpdate();

    const $set = update.$set ?? {};
    const $setOnInsert = update.$setOnInsert ?? {};

    if (createdAt) {
      if (update[createdAt]) {
        delete update[createdAt];
      }
      if ($set[createdAt]) {
        delete $set[createdAt];
        update.$set = $set;
      }
      $setOnInsert[createdAt] = timestamp;
      update.$setOnInsert = $setOnInsert;
    }
    if (updatedAt) {
      if ($set[updatedAt]) {
        delete $set[updatedAt];
        update.$set = $set;
      }
      if ($setOnInsert[updatedAt]) {
        delete $setOnInsert[updatedAt];
        update.$setOnInsert = $setOnInsert;
      }
      update[updatedAt] = timestamp;
    }

    this.setUpdate(update);

    next();
  }

  const props = {} as any;
  if (createdAt) props[createdAt] = Date;
  if (updatedAt) props[updatedAt] = Date;
  schema.add(props);

  schema.pre('save', onSave);
  schema.pre('update', onUpdate);
  schema.pre('updateOne', onUpdate);
  schema.pre('findOneAndUpdate', onUpdate);
}
