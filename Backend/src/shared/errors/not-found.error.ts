import type { ErrorShape } from "./error.shape.js";

export class NotFoundError implements ErrorShape {
  readonly kind = "not_found";
  readonly timestamp = new Date();

  constructor(
    public readonly message: string
  ) {}
}