import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class PermissionAlreadyExistsError implements ErrorShape {
  readonly kind = 'permission_already_exists';
  readonly timestamp = new Date();

  constructor(public readonly message = 'A permission with this key already exists.') {}
}
