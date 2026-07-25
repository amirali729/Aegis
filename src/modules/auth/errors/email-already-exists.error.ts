import { DomainError } from "../../../shared/errors/domain.error.js";

export class EmailAlreadyExistsError extends DomainError {
  readonly kind = "email_already_exists";

  constructor() {
    super("Email already exists.");
  }
}