export class AuditLogResponse {
  constructor(
    public readonly id: string,
    public readonly actorId: string | undefined,
    public readonly actorType: 'user' | 'system' | 'api_key',
    public readonly action: string,
    public readonly success: boolean,
    public readonly targetType: string | undefined,
    public readonly targetId: string | undefined,
    public readonly ipAddress: string | undefined,
    public readonly userAgent: string | undefined,
    public readonly metadata: Record<string, unknown> | undefined,
    public readonly createdAt: Date,
  ) {}
}
