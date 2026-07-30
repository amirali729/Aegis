import type { NextFunction, Request, Response } from 'express';
import type {
  MemberListResult,
  MemberResult,
  RemoveMemberResult,
} from '../../types/membership.types.js';

export interface IMembershipController {
  list(req: Request, res: Response, next: NextFunction): Promise<MemberListResult>;

  suspend(req: Request, res: Response, next: NextFunction): Promise<MemberResult>;

  reactivate(req: Request, res: Response, next: NextFunction): Promise<MemberResult>;

  remove(req: Request, res: Response, next: NextFunction): Promise<RemoveMemberResult>;
}
