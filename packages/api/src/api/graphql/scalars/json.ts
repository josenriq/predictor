import { GraphQLScalarType, Kind, ValueNode, GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import { parseObject } from './object-parser';

function decode(value: unknown): any {
  if (typeof value === 'object') {
    return value;
  }
  throw new GraphQLError(
    `Unable to convert provided value to json: ${JSON.stringify(value)}`,
  );
}

function encode(value: unknown): any {
  return decode(value);
}

export const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'An object representing a simple JSON object',
  parseValue(value: unknown): any {
    return decode(value);
  },
  serialize(value: unknown): any {
    return encode(value);
  },
  parseLiteral(ast: ValueNode, variables: any): JSON {
    if (ast.kind !== Kind.OBJECT) {
      throw new GraphQLError(
        `JSON can be represented by an object, but got ${ast.kind} type instead.`,
      );
    }
    return decode(parseObject(ast, variables));
  },
});

export const JSONTypeDef = gql`
  scalar JSON
`;

export const JSONResolver = {
  JSON: JSONScalar,
};
