export function join(...parts: Array<string>): string {
  return parts.filter(Boolean).reduce((base, next) => {
    if (base == null || base === '') return next;
    if (next == null || next === '') return base;
    return `${base.replace(/\/+$/, '')}/${next.replace(/^\/+/, '')}`;
  }, '');
}
