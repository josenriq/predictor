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
