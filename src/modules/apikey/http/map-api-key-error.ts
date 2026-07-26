import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { ApikeyError } from '../types/api-key.types.js';

const errorMap: Record<ApikeyError['kind'], (error: ApikeyError) => BaseErrorResponse> = {
  api_key_not_found: (error) => new BaseErrorResponse(error.message, 404),

  application_not_found: (error) => new BaseErrorResponse(error.message, 404),

  invalid_api_key: (error) => new BaseErrorResponse(error.message, 401),

  validation_error: (error) => new BaseErrorResponse(error.message, 400),

  infrastructure: (error) => new BaseErrorResponse(error.message, 500),
};

export function mapApplicationError(error: ApikeyError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
