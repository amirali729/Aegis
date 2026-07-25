import type { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.js';
import { BaseErrorResponse } from '../response/base.error.response.js';
import { HttpStatus } from './http-status.js';

/**
 * Registered last, after all routers. Anything that calls next(error)
 * (see shared/http/handle.ts) ends up here instead of falling through
 * to Express's default handler, which would leak stack traces.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  Logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err);

  if (res.headersSent) {
    return;
  }

  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again later.'
      : err instanceof Error
        ? err.message
        : 'Something went wrong.';

  return new BaseErrorResponse(message, HttpStatus.INTERNAL_SERVER_ERROR).send(res);
}

/**
 * Registered right before errorHandler, after all routes. Catches
 * requests that didn't match any route.
 */
export function notFoundHandler(req: Request, res: Response) {
  return new BaseErrorResponse(
    `Route ${req.method} ${req.originalUrl} not found.`,
    HttpStatus.NOT_FOUND,
  ).send(res);
}
