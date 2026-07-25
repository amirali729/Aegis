import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class RoleAlreadyExistsError implements ErrorShape {
  readonly kind = 'role_already_exists';
  readonly timestamp = new Date();

  constructor(public readonly message = 'A role with this name already exists.') {}
}
