import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class InvalidClientCredentialsError implements ErrorShape {
  readonly kind = 'invalid_client_credentials';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Invalid client credentials.') {}
}
