import { GraphQLScalarType, Kind, ValueNode, GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import { Maybe } from '@predictor/core';
import { Url } from '@predictor/domain';

function decode(value: unknown): Url {
  if (value instanceof Url) return value;
  return Url.decode(value as string);
}

function encode(value: unknown): string {
  return Url.encode(decode(value));
}

export const UrlScalar = new GraphQLScalarType({
  name: 'Url',
  description: 'An url string',
  parseValue(value: unknown): Maybe<Url> {
    if (!value) return null;
    return decode(value);
  },
  serialize(value: unknown): string {
    return encode(value);
  },
  parseLiteral(ast: ValueNode): Maybe<Url> {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(
        `Urls cannot be represented by a non-string type, but got ${ast.kind} type instead.`,
      );
    }
    if (!ast.value) return null;
    return decode(ast.value);
  },
});

export const UrlTypeDef = gql`
  scalar Url
`;

export const UrlResolver = { Url: UrlScalar };
