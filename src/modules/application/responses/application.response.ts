export class ApplicationResponse {
  constructor(
    public readonly id: string,
    public readonly tenantId: string | undefined,
    public readonly name: string,
    public readonly clientId: string,
    public readonly allowedOrigins: string[],
    public readonly redirectUris: string[],
    public readonly accessTokenTTL: string,
    public readonly refreshTokenTTL: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
  ) {}
}
