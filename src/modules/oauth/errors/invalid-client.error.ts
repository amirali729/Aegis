import type { ErrorShape } from '../../../shared/errors/error.shape.js';

/**
 * Raised when client_id is unknown/inactive, or redirect_uri doesn't
 * exactly match one of that client's registered redirectUris. Both cases
 * are deliberately NOT redirected anywhere (see authorize.types.ts) -
 * redirecting on an unverified redirect_uri is exactly the open-redirect
 * hole OAuth's exact-match requirement exists to prevent.
 */
export class InvalidClientError implements ErrorShape {
  readonly kind = 'invalid_client';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Unknown client or unregistered redirect URI.') {}
}
