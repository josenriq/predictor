import { isDomainError, DomainError } from '@predictor/domain';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

export function formatError(error: GraphQLError): GraphQLFormattedError {
  if (isDomainError(error?.originalError)) {
    const domainError = error.originalError as DomainError;
    return {
      message: domainError.message,
      extensions: {
        code: domainError.code,
      },
    };
  }
  return error;
}
