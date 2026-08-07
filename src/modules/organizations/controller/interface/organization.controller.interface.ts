import type { NextFunction, Request, Response } from 'express';
import type {
  DeleteOrganizationResult,
  OrganizationListResult,
  OrganizationMembershipListResult,
  OrganizationResult,
} from '../../types/organization.types.js';

export interface IOrganizationController {
  list(req: Request, res: Response, next: NextFunction): Promise<OrganizationListResult>;

  listMine(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<OrganizationMembershipListResult>;

  getById(req: Request, res: Response, next: NextFunction): Promise<OrganizationResult>;

  create(req: Request, res: Response, next: NextFunction): Promise<OrganizationResult>;

  update(req: Request, res: Response, next: NextFunction): Promise<OrganizationResult>;

  delete(req: Request, res: Response, next: NextFunction): Promise<DeleteOrganizationResult>;
}
