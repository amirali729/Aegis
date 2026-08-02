import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { AuthorizeError } from '../types/authorize.types.js';

const errorMap: Record<AuthorizeError['kind'], (error: AuthorizeError) => BaseErrorResponse> = {
  invalid_client: (error) => new BaseErrorResponse(error.message, 400),

  validation_error: (error) => new BaseErrorResponse(error.message, 400),

  infrastructure: (error) => new BaseErrorResponse(error.message, 500),
};

export function mapAuthorizeError(error: AuthorizeError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
