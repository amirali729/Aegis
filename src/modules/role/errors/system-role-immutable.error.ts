import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class SystemRoleImmutableError implements ErrorShape {
  readonly kind = 'system_role_immutable';
  readonly timestamp = new Date();

  constructor(public readonly message = 'System roles cannot be renamed or deleted.') {}
}
