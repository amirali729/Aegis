import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class ApiKeyNotFoundError implements ErrorShape {
  readonly kind = 'api_key_not_found';
  readonly timestamp = new Date();

  constructor(public readonly message = 'API key not found.') {}
}
