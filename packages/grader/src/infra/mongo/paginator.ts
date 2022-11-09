import { Model, FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { Guard } from '@predictor/core';
import { Entity, Id } from '@predictor/domain';
import { Page, PageOptions } from '@predictor/domain/pagination';
import { DbModel } from './db-model';

export type MongoosePaginatorSortOptions<M extends DbModel> = {
  orderBy: keyof M;
  order: 'asc' | 'desc';
};

export type MongoosePaginatorOptions<
  E extends Entity<E> | DbModel,
  M extends DbModel,
> = {
  db: Model<DocumentType<M>>;
  mapper: (db: DocumentType<M>) => E;
  criteria: FilterQuery<DocumentType<M>>;
  select?: string;
  sort: Array<MongoosePaginatorSortOptions<M>>;
};

function isIdSort<M extends DbModel>({
  orderBy,
}: MongoosePaginatorSortOptions<M>): boolean {
  return isIdKey(orderBy);
}

function isIdKey<M extends DbModel>(key: keyof M): boolean {
  return /^_?id$/i.test(key.toString());
}

function getCursor<E extends Entity<E> | DbModel>(node: E): string {
  return node.id instanceof Id ? Id.encode(node.id) : node.id;
}

export async function relayPaginator<
  E extends Entity<E> | DbModel,
  M extends DbModel,
>(
  options: MongoosePaginatorOptions<E, M>,
  pagination: RelayPaginationOptions,
): Promise<Connection<E>> {
  Guard.require(options, 'options');
  Guard.require(pagination, 'pagination');
  const { db, mapper, criteria, sort, select } = options;
  const { first, last, before, after } = pagination;

  Guard.clause(
    !!first || !!last,
    'Either first or last shoud be defined in the pagination',
  );

  Guard.clause(sort.length > 0, 'At least one sort option must be specified');
  const hasIdSort = sort.some(isIdSort);
  if (!hasIdSort) {
    sort.push({ orderBy: '_id', order: sort[0].order });
  }

  const paginationFilter =
    before || after
      ? await filterWithCursor({
          db,
          before,
          after,
          sort,
        })
      : void 0;
  const filter = paginationFilter
    ? ({ $and: [criteria, paginationFilter] } as FilterQuery<DocumentType<M>>)
    : criteria;

  const total = await db.find(filter).countDocuments();
  const sortOptions = sortWithCursor({ sort });
  const { skip, limit, hasNextPage, hasPreviousPage } = paginate({
    total,
    first,
    last,
  });

  const query = db.find(filter).sort(sortOptions);
  if (skip) query.skip(skip);
  if (limit) query.limit(limit);
  if (select) query.select(select);

  const nodes = await query.exec().then(xs =>
    xs.map(x => {
      if (x == null) return x;
      return mapper(x);
    }),
  );

  return {
    edges: nodes.map(node => ({ cursor: getCursor(node), node })),
    nodes,
    pageInfo: {
      startCursor: nodes.length ? getCursor(nodes[0]) : void 0,
      endCursor: nodes.length ? getCursor(nodes[nodes.length - 1]) : void 0,
      hasNextPage,
      hasPreviousPage,
    },
    totalCount: total,
  };
}

type FilterWithCursorOptions<M extends DbModel> = {
  db: Model<DocumentType<M>>;
  before?: string;
  after?: string;
  sort: Array<MongoosePaginatorSortOptions<M>>;
};

async function filterWithCursor<M extends DbModel>({
  db,
  before,
  after,
  sort,
}: FilterWithCursorOptions<M>): Promise<
  FilterQuery<DocumentType<M>> | undefined
> {
  if (!before && !after) return void 0;

  const cursor = before ?? after;
  let refObject: DocumentType<M> | null = null;

  const hasNonIdKey = !sort.every(isIdSort);
  if (hasNonIdKey) {
    refObject = await db.findOne({ _id: cursor } as any).exec();
    if (!refObject) throw new Error('before or after not found');
  }

  const $or: any[] = [];
  for (let i = 0; i < sort.length; i++) {
    const $and: any[] = [];

    for (let j = 0; j < i; j++) {
      const ancestor = sort[j];
      if (isIdSort(ancestor)) {
        $and.push({ [ancestor.orderBy as string]: cursor });
      } else {
        if (!refObject) throw new Error('before or after not found');
        const refObjectValue = refObject[ancestor.orderBy];
        if ((refObjectValue as any) === 0) {
          $and.push({
            $or: [
              { [ancestor.orderBy as string]: refObjectValue },
              { [ancestor.orderBy as string]: { $exists: false } },
            ],
          });
        } else {
          $and.push({ [ancestor.orderBy as string]: refObjectValue });
        }
      }
    }

    const { orderBy, order } = sort[i];
    const op = before
      ? order === 'asc'
        ? '$lt'
        : '$gt'
      : order === 'asc'
      ? '$gt'
      : '$lt';

    if (isIdKey(orderBy)) {
      $and.push({ [orderBy]: { [op]: cursor } });
    } else {
      if (!refObject) throw new Error('before or after not found');
      const refObjectValue = refObject[orderBy];
      $and.push({ [orderBy]: { [op]: refObjectValue } });
    }

    $or.push($and.length === 1 ? $and[0] : { $and });
  }

  return $or.length === 1 ? $or[0] : { $or };
}

type SortWithCursorOptions<M extends DbModel> = {
  sort: Array<MongoosePaginatorSortOptions<M>>;
};

function sortWithCursor<M extends DbModel>({
  sort,
}: SortWithCursorOptions<M>): any {
  return sort.reduce(
    (res, { orderBy, order }) => ({
      ...res,
      [orderBy]: order,
    }),
    {},
  );
}

type PaginateOptions = { total: number; first?: number; last?: number };
type PaginationResult = {
  limit?: number;
  skip?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

function paginate({ total, first, last }: PaginateOptions): PaginationResult {
  let limit;
  let skip;

  if (first || last) {
    if (first) {
      limit = first;
    }
    if (last) {
      if (limit && limit > last) {
        skip = limit - last;
        limit = limit - skip;
      } else if (!limit && total > last) {
        skip = total - last;
      }
    }
  }

  return {
    limit,
    skip,
    hasNextPage: Boolean(first && total > first),
    hasPreviousPage: Boolean(last && total > last),
  };
}

export async function paginator<
  E extends Entity<E> | DbModel,
  M extends DbModel,
>(
  options: MongoosePaginatorOptions<E, M>,
  pagination: PageOptions,
): Promise<Page<E>> {
  Guard.require(options, 'options');
  Guard.require(pagination, 'pagination');
  const { db, mapper, criteria, sort, select } = options;
  const { pageNumber, pageSize } = pagination;

  Guard.clause(
    pageNumber != null && !!pageSize,
    'Both the page number and size must be specified.',
  );

  Guard.clause(sort.length > 0, 'At least one sort option must be specified');
  const sortOptions = sortWithCursor({ sort });

  const total = await db.find(criteria).countDocuments();
  const query = db
    .find(criteria)
    .sort(sortOptions)
    .skip(pageNumber * pageSize)
    .limit(pageSize);
  if (select) query.select(select);

  const results = await query
    .exec()
    .then(records => records.map(r => mapper(r)));

  return {
    total,
    results,
    pageNumber,
    pageSize,
  };
}
