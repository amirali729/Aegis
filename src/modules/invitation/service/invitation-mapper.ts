import type { IInvitation } from '../model/invitation.model.js';
import { InvitationResponse } from '../responses/invitation.response.js';

export function toInvitationResponse(invitation: IInvitation): InvitationResponse {
  return new InvitationResponse(
    invitation._id.toString(),
    invitation.organizationId.toString(),
    invitation.email,
    invitation.status,
    invitation.expiresAt,
    invitation.createdAt,
  );
}
