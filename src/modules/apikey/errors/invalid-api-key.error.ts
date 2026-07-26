import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class InvalidApiKeyError implements ErrorShape {
  readonly kind = 'invalid_api_key';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Invalid, expired, or revoked API key.') {}
}
