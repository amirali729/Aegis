import type { Response } from 'express';

export class BaseResponse<T> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: T;
  public readonly timestamp: string;

  constructor(data: T, statusCode = 200, message = 'Request completed successfully.') {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  send(res: Response) {
    return res.status(this.statusCode).json(this);
  }
}
