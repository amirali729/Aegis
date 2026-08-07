import type { AuditLogResponse } from '../../audit/responses/audit-log.response.js';

export class RecentActivityResponse {
  constructor(
    public readonly items: AuditLogResponse[],
    public readonly total: number,
    /** True when this reflects the caller's own actions (no resolved tenant) rather than the whole organization's. */
    public readonly scopedToSelf: boolean,
  ) {}
}
