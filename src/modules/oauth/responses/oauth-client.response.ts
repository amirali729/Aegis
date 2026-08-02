export class OAuthClientResponse {
  constructor(
    public readonly id: string,
    public readonly applicationId: string,
    public readonly name: string,
    public readonly clientId: string,
    public readonly clientType: 'confidential' | 'public',
    public readonly redirectUris: string[],
    public readonly grantTypes: string[],
    public readonly scopes: string[],
    public readonly status: 'active' | 'revoked',
    public readonly createdAt: Date,
  ) {}
}
