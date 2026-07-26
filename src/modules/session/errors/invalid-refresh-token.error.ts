import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class InvalidRefreshTokenError implements ErrorShape {
  readonly kind = 'invalid_refresh_token';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Invalid or revoked refresh token.') {}
}
