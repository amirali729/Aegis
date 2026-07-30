import type { NextFunction, Request, Response } from 'express';
import type {
  AcceptInvitationResult,
  InvitationListResult,
  InvitationResult,
  RevokeInvitationResult,
} from '../../types/invitation.types.js';

export interface IInvitationController {
  invite(req: Request, res: Response, next: NextFunction): Promise<InvitationResult>;

  list(req: Request, res: Response, next: NextFunction): Promise<InvitationListResult>;

  revoke(req: Request, res: Response, next: NextFunction): Promise<RevokeInvitationResult>;

  accept(req: Request, res: Response, next: NextFunction): Promise<AcceptInvitationResult>;
}
