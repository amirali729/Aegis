import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { AuditError } from '../types/audit.types.js';

export function mapAuditError(error: AuditError): BaseErrorResponse {
  return new BaseErrorResponse(error.message, 500);
}
