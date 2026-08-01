import type { NextFunction, Request, Response } from 'express';
import type {
  AssignRoleResult,
  DeleteRoleResult,
  RoleListResult,
  RoleResult,
} from '../../types/role.types.js';

export interface IRoleController {
  list(req: Request, res: Response, next: NextFunction): Promise<RoleListResult>;

  getById(req: Request, res: Response, next: NextFunction): Promise<RoleResult>;

  create(req: Request, res: Response, next: NextFunction): Promise<RoleResult>;

  updateMeta(req: Request, res: Response, next: NextFunction): Promise<RoleResult>;

  setPermissions(req: Request, res: Response, next: NextFunction): Promise<RoleResult>;

  delete(req: Request, res: Response, next: NextFunction): Promise<DeleteRoleResult>;

  assignToUser(req: Request, res: Response, next: NextFunction): Promise<AssignRoleResult>;

  removeFromUser(req: Request, res: Response, next: NextFunction): Promise<AssignRoleResult>;
}
