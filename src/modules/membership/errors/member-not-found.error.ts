import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class MemberNotFoundError implements ErrorShape {
  readonly kind = 'member_not_found';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Member not found in this organization.') {}
}
