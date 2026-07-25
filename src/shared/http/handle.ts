import type { Request, Response, NextFunction } from 'express';
import type { Result } from '../result/result.js';
import type { ErrorShape } from '../errors/error.shape.js';
import { BaseResponse } from '../response/base.response.js';
import type { BaseErrorResponse } from '../response/base.error.response.js';
import { HttpStatus } from '../http/http-status.js';

/**
 * Wraps a controller method that returns a Result<T, E>, translating it
 * into an HTTP response. Each module supplies its own error mapper (e.g.
 * mapAuthError, mapRoleError) so this stays decoupled from any one
 * module's error union.
 */
export function handle<T, E extends ErrorShape>(
  controller: (req: Request, res: Response, next: NextFunction) => Promise<Result<T, E>>,
  mapError: (error: E) => BaseErrorResponse,
  successStatus: number = HttpStatus.OK,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await controller(req, res, next);

      if (!result.ok) {
        return mapError(result.error).send(res);
      }

      return new BaseResponse(result.value, successStatus).send(res);
    } catch (error) {
      next(error);
    }
  };
}
