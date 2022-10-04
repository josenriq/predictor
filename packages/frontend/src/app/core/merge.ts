// taken from: https://github.com/voodoocreation/ts-deepmerge/blob/ee9fc24bb7ab9ce13665c78b5225c47c7bab66d6/src/index.ts

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

function isObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj == null) return false;

  if (typeof Object.getPrototypeOf !== 'function') {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  const prototype = Object.getPrototypeOf(obj);
  return prototype === Object.prototype || prototype === null;
}

export function merge<T extends Record<string | number | symbol, any>[]>(
  ...objects: T
): UnionToIntersection<T[number]> {
  return objects.reduce((result, current) => {
    Object.keys(current).forEach(key => {
      if (Array.isArray(result[key]) && Array.isArray(current[key])) {
        result[key] = Array.from(new Set(result[key].concat(current[key])));
      } else if (isObject(result[key]) && isObject(current[key])) {
        result[key] = merge(result[key], current[key]);
      } else {
        result[key] = current[key];
      }
    });

    return result;
  }, {}) as any;
}
