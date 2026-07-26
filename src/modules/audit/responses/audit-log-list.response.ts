import type { AuditLogResponse } from './audit-log.response.js';

export class AuditLogListResponse {
  constructor(
    public readonly logs: AuditLogResponse[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
