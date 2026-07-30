import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class AlreadyMemberError implements ErrorShape {
  readonly kind = 'already_member';
  readonly timestamp = new Date();

  constructor(public readonly message = 'This user is already a member of the organization.') {}
}
