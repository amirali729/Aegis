import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { PermissionError } from '../types/permission.types.js';

const errorMap: Record<PermissionError['kind'], (error: PermissionError) => BaseErrorResponse> = {
  permission_not_found: (error) => new BaseErrorResponse(error.message, 404),

  permission_already_exists: (error) => new BaseErrorResponse(error.message, 409),

  invalid_permission_key: (error) => new BaseErrorResponse(error.message, 400),

  validation_error: (error) => new BaseErrorResponse(error.message, 400),

  infrastructure: (error) => new BaseErrorResponse(error.message, 500),
};

export function mapPermissionError(error: PermissionError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
