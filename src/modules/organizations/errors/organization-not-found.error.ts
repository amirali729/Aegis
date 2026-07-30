import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class OrganizationNotFoundError implements ErrorShape {
  readonly kind = 'organization_not_found';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Organization not found.') {}
}
