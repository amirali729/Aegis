import { DomainError } from "../../../shared/errors/domain.error.js";

export class UsernameAlreadyExistsError extends DomainError {
  readonly kind = "username_already_exists";

  constructor() {
    super("Username already exists.");
  }
}