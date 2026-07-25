import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { BaseErrorResponse } from '../response/base.error.response.js';
import { HttpStatus } from './http-status.js';

interface ValidationTargets {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

/**
 * Validates req.body / req.params / req.query against the given Zod
 * schemas. On success, replaces each target with the parsed (and
 * coerced/trimmed) value so controllers always receive clean data.
 * On failure, responds 400 with a readable, field-level message.
 */
export function validate(targets: ValidationTargets) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const [key, schema] of Object.entries(targets)) {
      if (!schema) continue;

      const result = schema.safeParse((req as unknown as Record<string, unknown>)[key]);

      if (!result.success) {
        const message = result.error.issues
          .map(
            (issue: { path: PropertyKey[]; message: string }) =>
              `${issue.path.join('.') || key}: ${issue.message}`,
          )
          .join('; ');

        return new BaseErrorResponse(message, HttpStatus.BAD_REQUEST).send(res);
      }

      (req as unknown as Record<string, unknown>)[key] = result.data;
    }

    next();
  };
}
