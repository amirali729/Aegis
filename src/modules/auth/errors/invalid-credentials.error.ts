import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class InvalidCredentialsError implements ErrorShape {
  readonly kind = 'invalid_credentials';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Invalid username or password.') {}
}
