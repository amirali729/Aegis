import type { Request, Response, NextFunction } from 'express';
import type {
  DeleteTenantResult,
  TenantListResult,
  TenantResult,
} from '../../types/tenant.types.js';

export interface ITenantController {
  list(req: Request, res: Response, next: NextFunction): Promise<TenantListResult>;

  getById(req: Request, res: Response, next: NextFunction): Promise<TenantResult>;

  create(req: Request, res: Response, next: NextFunction): Promise<TenantResult>;

  update(req: Request, res: Response, next: NextFunction): Promise<TenantResult>;

  delete(req: Request, res: Response, next: NextFunction): Promise<DeleteTenantResult>;
}
