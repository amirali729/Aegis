import type { EmailAlreadyExistsError } from "../errors/email-already-exists.error.js";
import type { UsernameAlreadyExistsError } from "../errors/username-already-exists.error.js";
import type { InvalidPasswordError } from "../errors/invalid-password.error.js";
import type { UserNotFoundError } from "../errors/user-not-found.error.js";
import type { InvalidTokenError } from "../errors/invalid-token.error.js";
import type { RefreshTokenExpiredError } from "../errors/refresh-token-expired.error.js";

import type { InfrastructureError } from "../../../shared/errors/infrastructure.error.js";
import type { ValidationError } from "../../../shared/errors/validation.error.js";

export type AuthError =
  | EmailAlreadyExistsError
  | UsernameAlreadyExistsError
  | InvalidPasswordError
  | UserNotFoundError
  | InvalidTokenError
  | RefreshTokenExpiredError
  | ValidationError
  | InfrastructureError;