export class ListAuditLogsDto {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 50,
    public readonly actorId?: string,
    public readonly action?: string,
    public readonly targetType?: string,
    public readonly targetId?: string,
    public readonly from?: Date,
    public readonly to?: Date,
  ) {}
}
