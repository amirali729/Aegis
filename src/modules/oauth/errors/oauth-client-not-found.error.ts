import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class OAuthClientNotFoundError implements ErrorShape {
  readonly kind = 'oauth_client_not_found';
  readonly timestamp = new Date();

  constructor(public readonly message = 'OAuth client not found.') {}
}
