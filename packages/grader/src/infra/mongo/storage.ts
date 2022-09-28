import { Model } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import DataLoader from 'dataloader';
import { Maybe, Guard } from '@predictor/core';
import { Storage, Mapper, Entity, Id } from '@predictor/domain';
import { DbModel } from './db-model';
import { createDataLoader } from './data-loader';

export abstract class MongooseStorage<E extends Entity<E>, M extends DbModel>
  implements Storage<Entity<E>>
{
  protected readonly loader: DataLoader<
    DocumentType<M>['_id'],
    Maybe<DocumentType<M>>
  >;
  protected readonly db: Model<DocumentType<M>>;
  protected readonly mapper: Mapper<E, DocumentType<M>>;

  constructor(
    db: Model<DocumentType<M>>,
    mapper: Mapper<E, DocumentType<M>>,
    loader?: DataLoader<DocumentType<M>['_id'], Maybe<DocumentType<M>>>,
  ) {
    Guard.require(db, 'db');
    Guard.require(mapper, 'mapper');

    this.db = db;
    this.mapper = mapper;
    this.loader = loader ?? createDataLoader({ db });
  }

  async find(id: Id): Promise<Maybe<E>> {
    Guard.require(id, 'id');
    return this.loader.load(Id.encode(id)).then(model => {
      if (!model) return void 0;
      return this.mapper.from(model);
    });
  }

  async remove(id: Id): Promise<void> {
    Guard.require(id, 'id');
    const _id = Id.encode(id);
    await this.db.deleteOne({ _id } as any).exec();
    this.loader.clear(_id);
  }

  async save(entity: E): Promise<void> {
    Guard.require(entity, 'entity');
    const model = this.mapper.to(entity);
    await this.db.findOneAndUpdate(
      { _id: model.id } as any,
      { $set: (model as any)._doc } as any,
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );
    this.loader.clear(model.id).prime(model.id, model);
  }
}
