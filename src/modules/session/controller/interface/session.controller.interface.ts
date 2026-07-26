import type { Request, Response, NextFunction } from 'express';
import type { RevokeSessionResult, SessionListResult } from '../../types/session.types.js';

export interface ISessionController {
  list(req: Request, res: Response, next: NextFunction): Promise<SessionListResult>;

  revoke(req: Request, res: Response, next: NextFunction): Promise<RevokeSessionResult>;
}
