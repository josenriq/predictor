// taken from https://github.com/excitement-engineer/graphql-iso-date
// DateTime scalar
import { GraphQLScalarType, Kind, ValueNode, GraphQLError } from 'graphql';
import gql from 'graphql-tag';

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function validateTime(raw: string): boolean {
  const TIME_REGEX = /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;
  return TIME_REGEX.test(raw);
}

function validateDate(raw: string): boolean {
  const RFC_3339_REGEX = /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]))$/;
  if (!RFC_3339_REGEX.test(raw)) return false;

  const year = Number(raw.substr(0, 4));
  const month = Number(raw.substr(5, 2));
  const day = Number(raw.substr(8, 2));

  switch (month) {
    case 2: // February
      if (isLeapYear(year) && day > 29) return false;
      if (!isLeapYear(year) && day > 28) return false;
      return true;
    case 4: // April
    case 6: // June
    case 9: // September
    case 11: // November
      if (day > 30) return false;
      return true;
  }
  return true;
}

function validateDateTime(raw: string): boolean {
  const RFC_3339_REGEX = /^(\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60))(\.\d{1,})?(([Z])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;
  if (!RFC_3339_REGEX.test(raw)) return false;

  const parsed = Date.parse(raw);
  if (parsed !== parsed) return false; // Check NaN

  const index = raw.indexOf('T');
  const date = raw.substr(0, index);
  const time = raw.substr(index + 1);
  return validateDate(date) && validateTime(time);
}

const MAX_INT = 2147483647;
const MIN_INT = -2147483648;
function validateUnixTimestamp(timestamp: number): boolean {
  return (
    timestamp === timestamp && timestamp <= MAX_INT && timestamp >= MIN_INT
  );
}

function validateJSDate(date: Date): boolean {
  const time = date.getTime();
  return time === time;
}

function decode(value: unknown): Date {
  if (value instanceof Date) {
    if (!validateJSDate(value)) {
      throw new Error('DateTime cannot represent an invalid Date instance');
    }
    return value;
  }
  if (typeof value === 'number') {
    if (!validateUnixTimestamp(value)) {
      throw new Error(
        `DateTime cannot represent an invalid Unix timestamp ${value}.`,
      );
    }
    return new Date(value * 1000);
  }
  if (typeof value === 'string') {
    if (!validateDateTime(value)) {
      throw new Error(
        `DateTime cannot represent an invalid date-time-string ${value}. It expects a ISO compilant format.`,
      );
    }
    return new Date(value);
  }
  throw new Error(`Invalide date value: ${value}`);
}

function encode(value: unknown): string {
  const date = decode(value);
  return date.toISOString();
}

export const DateScalar = new GraphQLScalarType({
  name: 'DateTime',
  description:
    'A date-time string at UTC. compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.',
  parseValue(value: unknown): Date {
    return decode(value);
  },
  serialize(value: unknown): string {
    return encode(value);
  },
  parseLiteral(ast: ValueNode): Date {
    if (ast.kind !== Kind.STRING && ast.kind !== Kind.INT) {
      throw new GraphQLError(
        `Date can be represented by a string or int type, but got ${ast.kind} type instead.`,
      );
    }
    return decode(ast.kind === Kind.INT ? parseInt(ast.value, 10) : ast.value);
  },
});

export const DateTypeDef = gql`
  scalar DateTime
`;

export const DateResolver = { DateTime: DateScalar };
