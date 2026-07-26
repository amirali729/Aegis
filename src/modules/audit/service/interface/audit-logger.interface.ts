import type { RecordAuditEventDto } from '../../dto/record-audit-event.dto.js';

export interface IAuditLogger {
  /**
   * Records an audit event. Never throws or rejects in a way that
   * should interrupt the caller - a failed audit write is logged
   * internally and swallowed, since losing an audit entry should never
   * take down a login/signup/role-change request.
   */
  record(dto: RecordAuditEventDto): Promise<void>;
}
