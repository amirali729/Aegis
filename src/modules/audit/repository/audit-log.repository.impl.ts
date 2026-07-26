import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { ListAuditLogsDto } from '../dto/list-audit-logs.dto.js';
import type { RecordAuditEventDto } from '../dto/record-audit-event.dto.js';
import type { IAuditLog } from '../model/audit-log.model.js';
import { AuditLog } from '../model/audit-log.model.js';
import type {
  DataResult,
  IAuditLogRepository,
} from './interface/audit-log.repository.interface.js';

export class AuditLogRepository implements IAuditLogRepository {
  async create(dto: RecordAuditEventDto): Promise<DataResult<IAuditLog>> {
    try {
      const log = await AuditLog.create({
        actorId: dto.actorId,
        actorType: dto.actorType,
        action: dto.action,
        success: dto.success,
        targetType: dto.targetType,
        targetId: dto.targetId,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        metadata: dto.metadata,
      });
      return ok(log);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findMany(
    filters: ListAuditLogsDto,
  ): Promise<DataResult<{ logs: IAuditLog[]; total: number }>> {
    try {
      const query: Record<string, unknown> = {};

      if (filters.actorId) query.actorId = filters.actorId;
      if (filters.action) query.action = filters.action;
      if (filters.targetType) query.targetType = filters.targetType;
      if (filters.targetId) query.targetId = filters.targetId;
      if (filters.from || filters.to) {
        query.createdAt = {
          ...(filters.from && { $gte: filters.from }),
          ...(filters.to && { $lte: filters.to }),
        };
      }

      const skip = (filters.page - 1) * filters.limit;

      const [logs, total] = await Promise.all([
        AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(filters.limit),
        AuditLog.countDocuments(query),
      ]);

      return ok({ logs, total });
    } catch {
      return err(new InfrastructureError());
    }
  }
}
