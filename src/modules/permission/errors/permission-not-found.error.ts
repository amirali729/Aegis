import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class PermissionNotFoundError implements ErrorShape {
  readonly kind = 'permission_not_found';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Permission not found.') {}
}
