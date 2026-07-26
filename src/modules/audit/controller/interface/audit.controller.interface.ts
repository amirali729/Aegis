import type { NextFunction, Request, Response } from 'express';
import type { AuditLogListResult } from '../../types/audit.types.js';

export interface IAuditController {
  list(req: Request, res: Response, next: NextFunction): Promise<AuditLogListResult>;
}
