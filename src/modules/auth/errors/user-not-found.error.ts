import { DomainError } from '../../../shared/errors/domain.error.js';

export class UserNotFoundError extends DomainError {
  readonly kind = 'user_not_found';

  constructor() {
    super('User not found.');
  }
}
