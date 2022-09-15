import { GraphQLID, GraphQLScalarType } from 'graphql';
import { Id } from '@predictor/domain';

function decode(value: unknown): Id {
  if (value instanceof Id) return value;
  return Id.decode(value as string);
}

function encode(value: unknown): string {
  return Id.encode(decode(value));
}

export function patchIdScalar(scalar: GraphQLScalarType): void {
  const serialize = scalar.serialize;
  const parseValue = scalar.parseValue;
  const parseLiteral = scalar.parseLiteral;
  scalar.serialize = (value): string => encode(serialize(value));
  scalar.parseValue = (value): Id => decode(parseValue(value));
  scalar.parseLiteral = (...args): Id => decode(parseLiteral(...args));
}
export const IdScalar = patchIdScalar(GraphQLID);
