export type Page<E> = {
  results: Array<E>;
  pageNumber: number;
  pageSize: number;
  hasMore: boolean;
};

export type PageInput = {
  pageNumber: number;
  pageSize: number;
};

export function emptyPage<E>(): Page<E> {
  return {
    results: [],
    pageNumber: 0,
    pageSize: 0,
    hasMore: false,
  };
}
