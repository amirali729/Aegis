import type { Request, Response, NextFunction } from 'express';
import type { ISessionController } from './interface/session.controller.interface.js';
import type { ISessionService } from '../service/interface/session.service.interface.js';
import type { RevokeSessionResult, SessionListResult } from '../types/session.types.js';

export class SessionController implements ISessionController {
  constructor(private readonly service: ISessionService) {}

  async list(req: Request, _res: Response, _next: NextFunction): Promise<SessionListResult> {
    return this.service.listByUser(req.user._id.toString(), req.cookies?.refreshToken);
  }

  async revoke(req: Request, _res: Response, _next: NextFunction): Promise<RevokeSessionResult> {
    return this.service.revokeSession(req.user._id.toString(), req.params.id as string);
  }
}
