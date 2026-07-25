import type { ErrorShape } from './error.shape.js';

export class UnauthorizedError implements ErrorShape {
  readonly kind = 'unauthorized';
  readonly timestamp = new Date();

  constructor(public readonly message = 'Unauthorized') {}
}
