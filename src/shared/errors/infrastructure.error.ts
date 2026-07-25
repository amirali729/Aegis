import type { ErrorShape } from "./error.shape.js";

export class InfrastructureError implements ErrorShape {
  readonly kind = "infrastructure";
  readonly timestamp = new Date();

  constructor(
    public readonly message =
      "Something went wrong. Please try again later."
  ) {}
}