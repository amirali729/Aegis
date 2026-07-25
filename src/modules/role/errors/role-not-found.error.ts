import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class RoleNotFoundError implements ErrorShape {
  readonly kind = 'role_not_found';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Role not found.') {}
}
