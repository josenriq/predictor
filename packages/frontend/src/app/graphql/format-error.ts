import { GraphQLError } from 'graphql';

export type CodeError = Error & {
  code?: number;
};

export function formatError(error: GraphQLError): CodeError | undefined {
  if (error) {
    return {
      ...error,
      code: error.extensions?.['code'] ?? (error as any).code ?? void 0,
    };
  }
  return void 0;
}
