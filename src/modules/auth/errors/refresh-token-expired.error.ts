import { DomainError } from '../../../shared/errors/domain.error.js';

export class RefreshTokenExpiredError extends DomainError {
  readonly kind = 'refresh_token_expired';

  constructor() {
    super('Refresh token has expired.');
  }
}
