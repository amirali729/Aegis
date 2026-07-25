import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { RoleError } from '../types/role.types.js';

const errorMap: Record<RoleError['kind'], (error: RoleError) => BaseErrorResponse> = {
  role_not_found: (error) => new BaseErrorResponse(error.message, 404),

  role_already_exists: (error) => new BaseErrorResponse(error.message, 409),

  system_role_immutable: (error) => new BaseErrorResponse(error.message, 403),

  permission_not_found: (error) => new BaseErrorResponse(error.message, 400),

  user_not_found: (error) => new BaseErrorResponse(error.message, 404),

  validation_error: (error) => new BaseErrorResponse(error.message, 400),

  infrastructure: (error) => new BaseErrorResponse(error.message, 500),
};

export function mapRoleError(error: RoleError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
