import type { HttpClient } from '../http-client.js';
import type { AuditLogList } from '../types.js';

export interface ListAuditLogsInput {
  page?: number;
  limit?: number;
  actorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  /** ISO 8601 datetime string */
  from?: string;
  /** ISO 8601 datetime string */
  to?: string;
}

export class AuditModule {
  constructor(private readonly http: HttpClient) {}

  async list(input: ListAuditLogsInput = {}): Promise<AuditLogList> {
    return this.http.request<AuditLogList>('GET', '/audit-logs', {
      query: {
        page: input.page,
        limit: input.limit,
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        from: input.from,
        to: input.to,
      },
    });
  }
}
