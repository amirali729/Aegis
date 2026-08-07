import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { DashboardError } from '../types/dashboard.types.js';

export function mapDashboardError(error: DashboardError): BaseErrorResponse {
  return new BaseErrorResponse(error.message, 500);
}
