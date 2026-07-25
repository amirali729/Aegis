import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class EmailAlreadyVerifiedError implements ErrorShape {
  readonly kind = 'email_already_verified';
  readonly timestamp = new Date();

  constructor(public readonly message = 'This email is already verified.') {}
}
