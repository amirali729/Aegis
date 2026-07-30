import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { InvitationError } from '../types/invitation.types.js';

const errorMap: Record<InvitationError['kind'], (error: InvitationError) => BaseErrorResponse> = {
  organization_not_found: (error) => new BaseErrorResponse(error.message, 404),

  invitation_not_found: (error) => new BaseErrorResponse(error.message, 404),

  invitation_expired: (error) => new BaseErrorResponse(error.message, 410),

  already_member: (error) => new BaseErrorResponse(error.message, 409),

  email_already_exists: (error) => new BaseErrorResponse(error.message, 409),

  username_already_exists: (error) => new BaseErrorResponse(error.message, 409),

  validation_error: (error) => new BaseErrorResponse(error.message, 400),

  infrastructure: (error) => new BaseErrorResponse(error.message, 500),
};

export function mapInvitationError(error: InvitationError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
