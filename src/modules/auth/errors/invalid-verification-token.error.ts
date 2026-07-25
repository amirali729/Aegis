import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class InvalidVerificationTokenError implements ErrorShape {
  readonly kind = 'invalid_verification_token';
  readonly timestamp = new Date();

  constructor(public readonly message = 'This verification link is invalid or has expired.') {}
}
