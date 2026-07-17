import { BaseErrorResponse } from "../response/base.error.response.js";

import type { AuthError } from "../../modules/auth/types/auth.types.js";

const errorMap: Record<
  AuthError["kind"],
  (error: AuthError) => BaseErrorResponse
> = {
  email_already_exists: (error) =>
    new BaseErrorResponse(error.message, 409),

  username_already_exists: (error) =>
    new BaseErrorResponse(error.message, 409),

  invalid_password: (error) =>
    new BaseErrorResponse(error.message, 401),

  user_not_found: (error) =>
    new BaseErrorResponse(error.message, 404),

  invalid_token: (error) =>
    new BaseErrorResponse(error.message, 401),

  refresh_token_expired: (error) =>
    new BaseErrorResponse(error.message, 401),

  validation_error: (error) =>
    new BaseErrorResponse(error.message, 400),

  infrastructure: (error) =>
    new BaseErrorResponse(error.message, 500),
};

export function mapAuthError(
  error: AuthError
): BaseErrorResponse {
  return errorMap[error.kind](error);
}