import type { IAuditLog } from '../model/audit-log.model.js';
import { AuditLogResponse } from '../responses/audit-log.response.js';

export function toAuditLogResponse(log: IAuditLog): AuditLogResponse {
  return new AuditLogResponse(
    log._id.toString(),
    log.actorId?.toString(),
    log.actorType,
    log.action,
    log.success,
    log.targetType,
    log.targetId,
    log.ipAddress,
    log.userAgent,
    log.metadata,
    log.createdAt,
  );
}
