import { DomainError } from '../../../shared/errors/domain.error.js';

export class InvalidPasswordError extends DomainError {
  readonly kind = 'invalid_password';

  constructor() {
    super('Invalid password.');
  }
}
