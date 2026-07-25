import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class InvalidPermissionKeyError implements ErrorShape {
  readonly kind = 'invalid_permission_key';
  readonly timestamp = new Date();

  constructor(
    public readonly message = "Permission keys must follow the 'resource:action' format (lowercase letters, numbers, underscores only).",
  ) {}
}
