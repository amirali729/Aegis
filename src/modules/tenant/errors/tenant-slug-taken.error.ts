import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class TenantSlugTakenError implements ErrorShape {
  readonly kind = 'tenant_slug_taken';
  readonly timestamp = new Date();

  constructor(public readonly message = 'This tenant slug is already in use.') {}
}
