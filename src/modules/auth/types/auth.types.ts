import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { ValidationError } from '../../../shared/errors/validation.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { AccountLockedError } from '../errors/account-locked.error.js';
import type { EmailAlreadyExistsError } from '../errors/email-already-exists.error.js';
import type { EmailAlreadyVerifiedError } from '../errors/email-already-verified.error.js';
import type { InvalidCredentialsError } from '../errors/invalid-credentials.error.js';
import type { InvalidPasswordError } from '../errors/invalid-password.error.js';
import type { InvalidResetTokenError } from '../errors/invalid-reset-token.error.js';
import type { InvalidTokenError } from '../errors/invalid-token.error.js';
import type { InvalidVerificationTokenError } from '../errors/invalid-verification-token.error.js';
import type { RefreshTokenExpiredError } from '../errors/refresh-token-expired.error.js';
import type { ResetTokenExpiredError } from '../errors/reset-token-expired.error.js';
import type { UserNotFoundError } from '../errors/user-not-found.error.js';
import type { UsernameAlreadyExistsError } from '../errors/username-already-exists.error.js';
import type { ChangePasswordResponse } from '../responses/change-password.response.js';
import type { ForgotPasswordResponse } from '../responses/forgot-password.response.js';
import type { LoginResponse } from '../responses/login.response.js';
import type { LogoutResponse } from '../responses/logout.response.js';
import type { RefreshTokenResponse } from '../responses/RefreshTokenResponse.js';
import type { ResendVerificationResponse } from '../responses/resend-verification.response.js';
import type { ResetPasswordResponse } from '../responses/reset-password.response.js';
import type { SignUpResponse } from '../responses/signup.response.js';
import type { VerifyEmailResponse } from '../responses/verify-email.response.js';

export type AuthError =
  | EmailAlreadyExistsError
  | UsernameAlreadyExistsError
  | InvalidPasswordError
  | InvalidCredentialsError
  | AccountLockedError
  | UserNotFoundError
  | InvalidTokenError
  | RefreshTokenExpiredError
  | InvalidVerificationTokenError
  | EmailAlreadyVerifiedError
  | InvalidResetTokenError
  | ResetTokenExpiredError
  | ValidationError
  | InfrastructureError;

export type SignUpResult = Result<SignUpResponse, AuthError>;

export type LoginResult = Result<LoginResponse, AuthError>;

export type ChangePasswordResult = Result<ChangePasswordResponse, AuthError>;
export type LogoutResult = Result<LogoutResponse, AuthError>;

export type RefreshTokenResult = Result<RefreshTokenResponse, AuthError>;

export type VerifyEmailResult = Result<VerifyEmailResponse, AuthError>;

export type ResendVerificationResult = Result<ResendVerificationResponse, AuthError>;

export type ForgotPasswordResult = Result<ForgotPasswordResponse, AuthError>;

export type ResetPasswordResult = Result<ResetPasswordResponse, AuthError>;
