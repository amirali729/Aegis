import type { ErrorShape } from './error.shape.js';

export abstract class DomainError implements ErrorShape {
  abstract readonly kind: string;

  readonly timestamp: Date;

  constructor(public readonly message: string) {
    this.timestamp = new Date();
  }
}
