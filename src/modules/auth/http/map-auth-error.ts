import { BaseErrorResponse } from '../../../shared/response/base.error.response.js';

import type { AuthError } from '../types/auth.types.js';

const errorMap: Record<AuthError['kind'], (error: AuthError) => BaseErrorResponse> = {
  email_already_exists: (error) => new BaseErrorResponse(error.message, 409),

  username_already_exists: (error) => new BaseErrorResponse(error.message, 409),

  invalid_password: (error) => new BaseErrorResponse(error.message, 401),

  invalid_credentials: (error) => new BaseErrorResponse(error.message, 401),

  account_locked: (error) => new BaseErrorResponse(error.message, 423),

  user_not_found: (error) => new BaseErrorResponse(error.message, 404),

  invalid_token: (error) => new BaseErrorResponse(error.message, 401),

  refresh_token_expired: (error) => new BaseErrorResponse(error.message, 401),

  invalid_verification_token: (error) => new BaseErrorResponse(error.message, 400),

  email_already_verified: (error) => new BaseErrorResponse(error.message, 409),

  invalid_reset_token: (error) => new BaseErrorResponse(error.message, 400),

  reset_token_expired: (error) => new BaseErrorResponse(error.message, 400),

  validation_error: (error) => new BaseErrorResponse(error.message, 400),

  infrastructure: (error) => new BaseErrorResponse(error.message, 500),
};

export function mapAuthError(error: AuthError): BaseErrorResponse {
  return errorMap[error.kind](error);
}
