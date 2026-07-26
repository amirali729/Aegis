import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class SessionExpiredError implements ErrorShape {
  readonly kind = 'session_expired';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Session expired. Please log in again.') {}
}
