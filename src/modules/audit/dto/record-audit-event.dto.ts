import type { AuditActorType } from '../model/audit-log.model.js';

export class RecordAuditEventDto {
  constructor(
    public readonly action: string,
    public readonly success: boolean,
    public readonly actorId?: string,
    public readonly actorType: AuditActorType = 'user',
    public readonly targetType?: string,
    public readonly targetId?: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
    public readonly metadata?: Record<string, unknown>,
  ) {}
}
