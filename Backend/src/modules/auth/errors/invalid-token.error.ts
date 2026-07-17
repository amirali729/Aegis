import { DomainError } from "../../../shared/errors/domain.error.js";

export class InvalidTokenError extends DomainError {
  readonly kind = "invalid_token";

  constructor() {
    super("Invalid token.");
  }
}