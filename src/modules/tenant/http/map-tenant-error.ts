import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { TenantError } from '../types/tenant.types.js';

const errorMap: Record<TenantError['kind'], (error: TenantError) => BaseErrorResponse> = {
  tenant_not_found: (error) => new BaseErrorResponse(error.message, 404),

  tenant_slug_taken: (error) => new BaseErrorResponse(error.message, 409),

  validation_error: (error) => new BaseErrorResponse(error.message, 400),

  infrastructure: (error) => new BaseErrorResponse(error.message, 500),
};

export function mapTenantError(error: TenantError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
