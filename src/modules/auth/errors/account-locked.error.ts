import { DomainError } from '../../../shared/errors/domain.error.js';

export class AccountLockedError extends DomainError {
  readonly kind = 'account_locked';

  constructor() {
    super(
      'This account is temporarily locked due to too many failed login attempts. Please try again later.',
    );
  }
}
