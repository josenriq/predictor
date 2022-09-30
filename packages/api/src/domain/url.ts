import { Maybe, Guard } from '@predictor/core';

const URL = (globalThis as any)['URL'];

export class Url {
  private readonly value: string;
  private constructor(value: string) {
    Guard.nonempty(value, 'value');
    this.value = value
      .replace(/^http:\/\/www\./i, 'http://')
      .replace(/^https:\/\/www\./i, 'https://')
      .replace(/\/$/, '');
  }

  equals(url: Maybe<Url>): boolean {
    if (url == null) return false;
    if (!(url instanceof this.constructor)) return false;
    return this.value === url.value;
  }

  valueOf(): string {
    return Url.encode(this);
  }

  toString(): string {
    return this.valueOf();
  }

  static decode(value: string): Url {
    Guard.clause(Url.validate(value), `Invalid url: ${value}`);
    return new Url(value);
  }

  static encode(url: Url): string {
    Guard.require(url, 'url');
    return url.value;
  }

  static validate(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  }
}
