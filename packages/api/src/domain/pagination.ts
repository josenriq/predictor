export type Page<E> = {
  results: Array<E>;
  pageNumber: number;
  pageSize: number;
};

export type PageInput = {
  pageNumber: number;
  pageSize: number;
};
