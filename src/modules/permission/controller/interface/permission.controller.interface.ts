import type { Request, Response, NextFunction } from 'express';
import type {
  DeletePermissionResult,
  PermissionListResult,
  PermissionResult,
} from '../../types/permission.types.js';

export interface IPermissionController {
  list(req: Request, res: Response, next: NextFunction): Promise<PermissionListResult>;

  getById(req: Request, res: Response, next: NextFunction): Promise<PermissionResult>;

  create(req: Request, res: Response, next: NextFunction): Promise<PermissionResult>;

  update(req: Request, res: Response, next: NextFunction): Promise<PermissionResult>;

  delete(req: Request, res: Response, next: NextFunction): Promise<DeletePermissionResult>;
}
