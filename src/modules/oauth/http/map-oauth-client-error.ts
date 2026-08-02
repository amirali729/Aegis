import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';
import type { OAuthClientError } from '../types/oauth-client.types.js';

const errorMap: Record<OAuthClientError['kind'], (error: OAuthClientError) => BaseErrorResponse> = {
  oauth_client_not_found: (error) => new BaseErrorResponse(error.message, 404),

  application_not_found: (error) => new BaseErrorResponse(error.message, 404),

  validation_error: (error) => new BaseErrorResponse(error.message, 400),

  infrastructure: (error) => new BaseErrorResponse(error.message, 500),
};

export function mapOAuthClientError(error: OAuthClientError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
