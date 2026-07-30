import type { NextFunction, Request, Response } from 'express';
import { ListAuditLogsDto } from '../dto/list-audit-logs.dto.js';
import type { IAuditService } from '../service/interface/audit.service.interface.js';
import type { AuditLogListResult } from '../types/audit.types.js';
import type { IAuditController } from './interface/audit.controller.interface.js';

export class AuditController implements IAuditController {
  constructor(private readonly service: IAuditService) {}

  async list(req: Request, _res: Response, _next: NextFunction): Promise<AuditLogListResult> {
    const dto = new ListAuditLogsDto(
      req.query.page ? Number(req.query.page) : 1,
      req.query.limit ? Number(req.query.limit) : 50,
      req.query.actorId as string | undefined,
      req.query.action as string | undefined,
      req.query.targetType as string | undefined,
      req.query.targetId as string | undefined,
      req.query.from ? new Date(req.query.from as string) : undefined,
      req.query.to ? new Date(req.query.to as string) : undefined,
      req.tenantId,
    );

    return this.service.list(dto);
  }
}
