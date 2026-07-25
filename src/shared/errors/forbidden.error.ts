import type { ErrorShape } from './error.shape.js';

export class ForbiddenError implements ErrorShape {
  readonly kind = 'forbidden';
  readonly timestamp = new Date();

  constructor(public readonly message = 'You do not have permission to perform this action.') {}
}
