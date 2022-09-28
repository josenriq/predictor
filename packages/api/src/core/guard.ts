export class Guard {
  static clause(condition: boolean, message: string): void {
    if (condition) return;
    throw new Error(message);
  }

  static require<T>(arg: T, name: string): void {
    return Guard.clause(arg != null, `Argument ${name} is required`);
  }

  static nonempty(arg: string | Array<unknown>, name: string): void {
    Guard.require(arg, name);
    const value = typeof arg === 'string' ? arg.trim() : arg;
    return Guard.clause(value.length > 0, `Argument ${name} cannot be empty`);
  }

  static finite(arg: number, name: string): void {
    Guard.clause(
      Number.isFinite(arg),
      `Argument ${name} should be a finite number`,
    );
  }

  static integer(arg: number, name: string): void {
    Guard.clause(
      Number.isInteger(arg),
      `Argument ${name} should be an integer`,
    );
  }

  static greaterThan(threshold: number, arg: number, name: string): void {
    return Guard.clause(
      arg > threshold,
      `Argument ${name} must be greater than ${threshold}, got ${arg}`,
    );
  }

  static greaterThanOrEqual(
    threshold: number,
    arg: number,
    name: string,
  ): void {
    return Guard.clause(
      arg >= threshold,
      `Argument ${name} must be greater than or equal to ${threshold}, got ${arg}`,
    );
  }

  static lessThan(threshold: number, arg: number, name: string): void {
    return Guard.clause(
      arg < threshold,
      `Argument ${name} must be less than ${threshold}, got ${arg}`,
    );
  }

  static lessThanOrEqual(threshold: number, arg: number, name: string): void {
    return Guard.clause(
      arg <= threshold,
      `Argument ${name} must be less than or equal to ${threshold}, got ${arg}`,
    );
  }

  static between(floor: number, ceil: number, arg: number, name: string): void {
    return Guard.clause(
      floor <= arg && arg <= ceil,
      `Argument ${name} must be between ${floor} and ${ceil}, got ${arg}`,
    );
  }

  static in<T>(options: Array<T> | readonly T[], value: T, name: string): void {
    const values = options ?? [];
    return Guard.clause(
      (values ?? []).includes(value),
      `Argument ${name} must be any of these values ${values.join(
        ', ',
      )}, but got ${value} instead.`,
    );
  }
}
