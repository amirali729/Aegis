import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class InvalidResetTokenError implements ErrorShape {
  readonly kind = 'invalid_reset_token';
  readonly timestamp = new Date();

  constructor(public readonly message = 'This password reset link is invalid.') {}
}
