export function localDateFrom(input: string | number | Date): Date {
  return input instanceof Date ? input : new Date(input);
}

export function utc(input: string | number | Date): Date {
  const date = localDateFrom(input);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
}
