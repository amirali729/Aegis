export class CreateApplicationDto {
  constructor(
    public readonly name: string,
    public readonly allowedOrigins: string[] = [],
    public readonly redirectUris: string[] = [],
    public readonly accessTokenTTL: string = '15m',
    public readonly refreshTokenTTL: string = '7d',
  ) {}
}
