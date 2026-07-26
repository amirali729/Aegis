import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { ApplicationError } from '../types/application.types.js';

const errorMap: Record<ApplicationError['kind'], (error: ApplicationError) => BaseErrorResponse> = {
  application_not_found: (error) => new BaseErrorResponse(error.message, 404),

  invalid_client_credentials: (error) => new BaseErrorResponse(error.message, 401),

  validation_error: (error) => new BaseErrorResponse(error.message, 400),

  infrastructure: (error) => new BaseErrorResponse(error.message, 500),
};

export function mapApplicationError(error: ApplicationError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
