import type { EmailAlreadyExistsError } from "../errors/email-already-exists.error.js";
import type { UsernameAlreadyExistsError } from "../errors/username-already-exists.error.js";
import type { InvalidPasswordError } from "../errors/invalid-password.error.js";
import type { UserNotFoundError } from "../errors/user-not-found.error.js";
import type { InvalidTokenError } from "../errors/invalid-token.error.js";
import type { RefreshTokenExpiredError } from "../errors/refresh-token-expired.error.js";
import type { InfrastructureError } from "../../../shared/errors/infrastructure.error.js";
import type { ValidationError } from "../../../shared/errors/validation.error.js";
import { Result } from "../../../shared/result/result.js";
import { SignUpResponse } from "../responses/signup.response.js";
import { LoginResponse } from "../responses/login.response.js";
import { ChangePasswordResponse } from "../responses/change-password.response.js";
import { LogoutResponse } from "../responses/logout.response.js";
import { RefreshTokenResponse } from "../responses/RefreshTokenResponse.js";

export type AuthError =
  | EmailAlreadyExistsError
  | UsernameAlreadyExistsError
  | InvalidPasswordError
  | UserNotFoundError
  | InvalidTokenError
  | RefreshTokenExpiredError
  | ValidationError
  | InfrastructureError;

  export type SignUpResult = Result<
  SignUpResponse,
  AuthError
>;

export type LoginResult = Result<
  LoginResponse,
  AuthError
>;

export type ChangePasswordResult = Result<
  ChangePasswordResponse,
  AuthError
>;
export type LogoutResult = Result<
  LogoutResponse,
  AuthError>

export type RefreshTokenResult = Result<
  RefreshTokenResponse,
  AuthError
>