import type { ListAuditLogsDto } from '../../dto/list-audit-logs.dto.js';
import type { AuditLogListResult } from '../../types/audit.types.js';
import type { IAuditLogger } from './audit-logger.interface.js';

export interface IAuditService extends IAuditLogger {
  list(dto: ListAuditLogsDto): Promise<AuditLogListResult>;
}
