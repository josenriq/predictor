import { APP_INITIALIZER } from '@angular/core';
import { SessionQuery } from './session.query';

export function initializeSession(query: SessionQuery): () => Promise<void> {
  return async (): Promise<void> => {
    try {
      await query.fetch();
    } catch (e) {
      console.error(e);
    }
  };
}

export const SESSION_INITIALIZER = {
  provide: APP_INITIALIZER,
  useFactory: initializeSession,
  deps: [SessionQuery],
  multi: true,
};
