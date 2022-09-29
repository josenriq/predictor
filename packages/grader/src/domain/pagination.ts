import { Guard } from '@predictor/core';

// Based on relay connections pattern: https://relay.dev/graphql/connections.htm
export type Edge<N, C = string> = {
  cursor: C;
  node: N;
};

export type RelayPageInfo<C = string> = {
  startCursor?: C;
  endCursor?: C;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type Connection<N, C = string> = {
  edges: Array<Edge<N, C>>;
  nodes: Array<N>;
  pageInfo: RelayPageInfo<C>;
  totalCount: number;
};

export function isConnection<N, C = string>(
  obj: unknown,
): obj is Connection<N, C> {
  return (
    !!obj &&
    Array.isArray((obj as any).edges) &&
    Array.isArray((obj as any).nodes) &&
    (obj as any).hasOwnProperty('pageInfo') &&
    (obj as any).hasOwnProperty('totalCount')
  );
}

export type RelayPaginationOptions<C = string> = {
  first?: number;
  last?: number;
  before?: C;
  after?: C;
};

export const EMPTY_CONNECTION: Readonly<Connection<any, any>> = {
  edges: [],
  nodes: [],
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
  },
  totalCount: 0,
};

export function mapConnection<T, R = T>(
  map: (node: T) => R,
  connection: Connection<T>,
): Connection<R> {
  Guard.require(map, 'map');
  Guard.require(connection, 'connection');

  return connection.edges.reduce(
    (xs, x) => {
      const node = map(x.node);
      xs.edges.push({ ...x, node });
      xs.nodes.push(node);
      return xs;
    },
    {
      ...connection,
      edges: [],
      nodes: [],
    } as Connection<R>,
  );
}

// Standard pagination
export type Page<E> = {
  results: Array<E>;
  pageNumber: number;
  pageSize: number;
  total: number;
};

export function isPage<E>(obj: unknown): obj is Page<E> {
  return (
    !!obj &&
    Array.isArray((obj as any).results) &&
    (obj as any).hasOwnProperty('pageNumber') &&
    (obj as any).hasOwnProperty('pageSize') &&
    (obj as any).hasOwnProperty('total')
  );
}

export type PageOptions = {
  pageNumber: number;
  pageSize: number;
};
