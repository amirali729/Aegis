import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { SettingsError } from '../types/settings.types.js';

const errorMap: Record<SettingsError['kind'], (error: SettingsError) => BaseErrorResponse> = {
  validation_error: (error) => new BaseErrorResponse(error.message, 400),
  unauthorized: (error) => new BaseErrorResponse(error.message, 401),
  not_found: (error) => new BaseErrorResponse(error.message, 404),
  infrastructure: (error) => new BaseErrorResponse(error.message, 500),
};

export function mapSettingsError(error: SettingsError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
