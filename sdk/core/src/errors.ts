export class IdentityApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly timestamp?: string,
  ) {
    super(message);
    this.name = 'IdentityApiError';
  }
}

export class IdentityNetworkError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'IdentityNetworkError';
  }
}
