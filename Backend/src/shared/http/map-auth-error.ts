import { BaseErrorResponse } from "../response/base.error.response.js";
import { ConflictError } from "../errors/conflict.error.js";
import { InfrastructureError } from "../errors/infrastructure.error.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { ValidationError } from "../errors/validation.error.js";
import type { ErrorShape } from "../errors/error.shape.js";

type AuthError =
  | ValidationError
  | UnauthorizedError
  | ConflictError
  | NotFoundError
  | InfrastructureError;

const errorMap: Record<
  AuthError["kind"],
  (error: AuthError) => BaseErrorResponse
> = {
  validation_error: (error) =>
    new BaseErrorResponse(error.message, 400),

  unauthorized: (error) =>
    new BaseErrorResponse(error.message, 401),

  conflict: (error) =>
    new BaseErrorResponse(error.message, 409),

  not_found: (error) =>
    new BaseErrorResponse(error.message, 404),

  infrastructure: (error) =>
    new BaseErrorResponse(error.message, 500),
};

export function mapAuthError(
  error: ErrorShape
): BaseErrorResponse {

  return errorMap[
    error.kind as AuthError["kind"]
  ](
    error as AuthError
  );
}