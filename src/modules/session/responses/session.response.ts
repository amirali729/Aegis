export class SessionResponse {
  constructor(
    public readonly id: string,
    public readonly deviceName: string,
    public readonly userAgent: string | undefined,
    public readonly ipAddress: string | undefined,
    public readonly lastActiveAt: Date,
    public readonly createdAt: Date,
    public readonly isCurrent: boolean,
  ) {}
}
