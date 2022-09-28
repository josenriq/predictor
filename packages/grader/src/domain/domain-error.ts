export abstract class DomainError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return !!(error as any).code && !!(error as any).message;
}
