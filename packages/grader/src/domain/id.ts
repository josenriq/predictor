import { uid } from 'uid/secure';
import { Maybe, Guard } from '@predictor/core';

const ID_LENGTH = 8;

export class Id {
  private readonly value: string;

  private constructor(value: string) {
    Guard.nonempty(value, 'value');
    this.value = value;
  }

  equals(id: Maybe<Id>): boolean {
    if (id == null) return false;
    if (!(id instanceof this.constructor)) return false;
    return this.value === id.value;
  }

  valueOf(): string {
    return Id.encode(this);
  }

  toString(): string {
    return this.valueOf();
  }

  static decode(value: string): Id {
    Guard.clause(Id.validate(value), `Invalid id: ${value}`);
    return new Id(value);
  }

  static encode(id: Id): string {
    Guard.require(id, 'id');
    return id.value;
  }

  static validate(value: string): boolean {
    if (!value) return false;
    return value.trim().length > 0;
  }

  static generate(): Id {
    return new Id(uid(ID_LENGTH));
  }
}
