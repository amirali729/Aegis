import type { Response } from "express";

export class BaseErrorResponse {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode = 500
  ) {
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  send(res: Response) {
    return res.status(this.statusCode).json(this);
  }
}