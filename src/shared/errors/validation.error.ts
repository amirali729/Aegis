import type { ErrorShape } from "./error.shape.js";

export class ValidationError implements ErrorShape {
  readonly kind = "validation_error";
  readonly timestamp = new Date();

  constructor(
    public readonly message: string
  ) {}
}