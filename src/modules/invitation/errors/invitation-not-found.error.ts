import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class InvitationNotFoundError implements ErrorShape {
  readonly kind = 'invitation_not_found';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Invitation not found or already used.') {}
}
