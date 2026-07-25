import type { ErrorShape } from './error.shape.js';

export class ConflictError implements ErrorShape {
  readonly kind = 'conflict';
  readonly timestamp = new Date();

  constructor(public readonly message: string) {}
}
