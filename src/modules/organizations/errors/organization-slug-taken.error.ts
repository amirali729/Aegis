import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class OrganizationSlugTakenError implements ErrorShape {
  readonly kind = 'organization_slug_taken';
  readonly timestamp = new Date();

  constructor(public readonly message = 'This organization slug is already in use.') {}
}
