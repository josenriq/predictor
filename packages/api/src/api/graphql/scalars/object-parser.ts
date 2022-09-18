// taken from: https://github.com/Urigo/graphql-scalars/blob/master/src/scalars/json/utils.ts
import { Kind, ValueNode, ObjectValueNode } from 'graphql';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function parseObject(ast: ObjectValueNode, variables: any): any {
  const value = Object.create(null);
  ast.fields.forEach(
    field => (value[field.name.value] = parseLiteral(field.value, variables)),
  );

  return value;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function parseLiteral(ast: ValueNode, variables: any): any {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT:
      return parseObject(ast, variables);
    case Kind.LIST:
      return ast.values.map(n => parseLiteral(n, variables));
    case Kind.NULL:
      return null;
    case Kind.VARIABLE: {
      const name = ast.name.value;
      return variables ? variables[name] : undefined;
    }
  }
}
