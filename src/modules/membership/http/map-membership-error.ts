import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { MembershipError } from '../types/membership.types.js';

const errorMap: Record<MembershipError['kind'], (error: MembershipError) => BaseErrorResponse> = {
  organization_not_found: (error) => new BaseErrorResponse(error.message, 404),

  member_not_found: (error) => new BaseErrorResponse(error.message, 404),

  already_member: (error) => new BaseErrorResponse(error.message, 409),

  infrastructure: (error) => new BaseErrorResponse(error.message, 500),
};

export function mapMembershipError(error: MembershipError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
