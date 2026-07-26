import type { Request, Response, NextFunction } from 'express';
import type {
  ApplicationCreatedResult,
  ApplicationListResult,
  ApplicationResult,
  DeleteApplicationResult,
  RegenerateSecretResult,
} from '../../types/application.types.js';

export interface IApplicationController {
  list(req: Request, res: Response, next: NextFunction): Promise<ApplicationListResult>;

  getById(req: Request, res: Response, next: NextFunction): Promise<ApplicationResult>;

  create(req: Request, res: Response, next: NextFunction): Promise<ApplicationCreatedResult>;

  update(req: Request, res: Response, next: NextFunction): Promise<ApplicationResult>;

  delete(req: Request, res: Response, next: NextFunction): Promise<DeleteApplicationResult>;

  regenerateSecret(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<RegenerateSecretResult>;
}
