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
