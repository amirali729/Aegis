import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { OrganizationError } from '../types/organization.types.js';

const errorMap: Record<OrganizationError['kind'], (error: OrganizationError) => BaseErrorResponse> =
  {
    organization_not_found: (error) => new BaseErrorResponse(error.message, 404),

    organization_slug_taken: (error) => new BaseErrorResponse(error.message, 409),

    validation_error: (error) => new BaseErrorResponse(error.message, 400),

    infrastructure: (error) => new BaseErrorResponse(error.message, 500),
  };

export function mapTenantError(error: OrganizationError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
