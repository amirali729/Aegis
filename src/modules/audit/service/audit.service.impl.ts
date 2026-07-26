import { err, ok } from '../../../shared/result/result.js';
import { Logger } from '../../../shared/utils/logger.js';
import type { ListAuditLogsDto } from '../dto/list-audit-logs.dto.js';
import type { RecordAuditEventDto } from '../dto/record-audit-event.dto.js';
import type { IAuditLogRepository } from '../repository/interface/audit-log.repository.interface.js';
import { AuditLogListResponse } from '../responses/audit-log-list.response.js';
import type { AuditLogListResult } from '../types/audit.types.js';
import { toAuditLogResponse } from './audit-log-mapper.js';
import type { IAuditService } from './interface/audit.service.interface.js';

export class AuditService implements IAuditService {
  constructor(private readonly repository: IAuditLogRepository) {}

  async record(dto: RecordAuditEventDto): Promise<void> {
    const created = await this.repository.create(dto);

    if (!created.ok) {
      // Deliberately swallowed - see IAuditLogger.record's contract.
      Logger.error(`Failed to record audit event "${dto.action}"`, created.error);
    }
  }

  async list(dto: ListAuditLogsDto): Promise<AuditLogListResult> {
    const found = await this.repository.findMany(dto);

    if (!found.ok) {
      return err(found.error);
    }

    return ok(
      new AuditLogListResponse(
        found.value.logs.map(toAuditLogResponse),
        found.value.total,
        dto.page,
        dto.limit,
      ),
    );
  }
}
