import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class ResetTokenExpiredError implements ErrorShape {
  readonly kind = 'reset_token_expired';
  readonly timestamp = new Date();

  constructor(
    public readonly message = 'This password reset link has expired. Please request a new one.',
  ) {}
}
