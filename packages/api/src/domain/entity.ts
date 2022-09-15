import { Maybe, Guard } from '@predictor/core';
import { Id } from './id';

export abstract class Entity<T> {
  public readonly id: Id;
  constructor(id: Id) {
    Guard.require(id, 'id');
    this.id = id;
  }

  equals(other: Maybe<Entity<T>>): boolean {
    if (other == null) return false;
    if (other === this) return true;
    return this.id.equals(other.id);
  }

  toString(): string {
    return `[${this.id}]`;
  }
}
