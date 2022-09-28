import { Maybe } from '@predictor/core';
import { Entity } from './entity';
import { Id } from './id';

export type Storage<T extends Entity<T>> = {
  find(id: Id): Promise<Maybe<T>>;
  save(entity: T): Promise<void>;
};
