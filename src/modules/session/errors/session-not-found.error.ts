import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class SessionNotFoundError implements ErrorShape {
  readonly kind = 'session_not_found';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Session not found.') {}
}
