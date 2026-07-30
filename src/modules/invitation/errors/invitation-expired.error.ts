import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export class InvitationExpiredError implements ErrorShape {
  readonly kind = 'invitation_expired';
  readonly timestamp = new Date();

  constructor(public readonly message = 'This invitation has expired.') {}
}
