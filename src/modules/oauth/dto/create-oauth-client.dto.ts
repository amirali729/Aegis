export class CreateOAuthClientDto {
  constructor(
    public readonly name: string,
    public readonly redirectUris: string[],
    public readonly clientType: 'confidential' | 'public' = 'confidential',
    public readonly grantTypes: string[] = ['authorization_code', 'refresh_token'],
    public readonly scopes: string[] = ['openid', 'profile', 'email'],
  ) {}
}
