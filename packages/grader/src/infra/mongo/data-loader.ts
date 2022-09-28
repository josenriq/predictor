import { Model } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import DataLoader from 'dataloader';
import { Maybe, Guard } from '@predictor/core';
import { DbModel } from './db-model';

export type MongooseDataLoaderOptions<M extends DbModel> = {
  db: Model<DocumentType<M>>;
  key?: keyof M;
  prop?: keyof M;
};

export type MongooseMultiKeyDataLoaderOptions<M extends DbModel> = {
  db: Model<DocumentType<M>>;
  keys: Array<keyof M>;
  props?: Array<keyof M>;
  keySeparator?: string;
};

export function createDataLoader<T extends DbModel, K extends keyof T>({
  db,
  key = '_id',
  prop = key,
}: MongooseDataLoaderOptions<T>): DataLoader<
  DocumentType<T>[K],
  Maybe<DocumentType<T>>
> {
  return new DataLoader(async keys => {
    const result = await db
      .find({ [`${String(key)}`]: { $in: keys } } as any)
      .exec();
    return keys.map(k => result.find(result => (result[prop] as any) === k));
  });
}

export function createMultiKeyDataLoader<T extends DbModel>({
  db,
  keys,
  props = keys,
  keySeparator = ',',
}: MongooseMultiKeyDataLoaderOptions<T>): DataLoader<
  string,
  Maybe<DocumentType<T>>
> {
  Guard.clause(
    keys.length === props.length,
    'keys and props must have the same size',
  );

  return new DataLoader(async valueGroupStrings => {
    const valueGroups = valueGroupStrings.map(str => str.split(keySeparator));

    const $or = valueGroups.map(group => {
      Guard.clause(
        group.length === keys.length,
        'All value groups must have the same size as the keys array',
      );
      return group.reduce(
        (acc, value, i) => ({ ...acc, [`${String(keys[i])}`]: value }),
        {} as Record<string, string>,
      );
    });

    const result = await db.find({ $or } as any).exec();

    return valueGroups.map(group =>
      result.find(result =>
        props.every((prop, i) => `${result[prop]}` === group[i]),
      ),
    );
  });
}

export function createListDataLoader<T extends DbModel, K extends keyof T>({
  db,
  key = '_id',
  prop = key,
}: MongooseDataLoaderOptions<T>): DataLoader<
  DocumentType<T>[K],
  Array<DocumentType<T>>
> {
  return new DataLoader(async keys => {
    const result = await db
      .find({ [`${String(key)}`]: { $in: keys } } as any)
      .exec();
    return keys.map(k => result.filter(result => (result[prop] as any) === k));
  });
}
