import { Injectable } from '@angular/core';

function serialize(value: unknown): string {
  return JSON.stringify(value);
}

function deserialize<T>(candidate: string | null, defaultValue: T): T {
  if (!candidate) return defaultValue;
  try {
    return JSON.parse(candidate);
  } catch (e) {
    return defaultValue;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalStorage {
  private readonly storage = window.localStorage;

  get<T>(key: string, defaultValue: T): T {
    return deserialize(this.storage.getItem(key), defaultValue);
  }

  set<T>(key: string, value: T): void {
    this.storage.setItem(key, serialize(value));
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }

  get keys(): Array<string> {
    return Array.from(
      { length: this.storage.length },
      (_, i) => this.storage.key(i) as string,
    );
  }
}
