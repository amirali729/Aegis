import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';
import type { ListAuditLogsDto } from '../../dto/list-audit-logs.dto.js';
import type { RecordAuditEventDto } from '../../dto/record-audit-event.dto.js';
import type { IAuditLog } from '../../model/audit-log.model.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IAuditLogRepository {
  create(dto: RecordAuditEventDto): Promise<DataResult<IAuditLog>>;

  findMany(filters: ListAuditLogsDto): Promise<DataResult<{ logs: IAuditLog[]; total: number }>>;
}
