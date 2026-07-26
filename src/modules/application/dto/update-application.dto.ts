export class UpdateApplicationDto {
  constructor(
    public readonly name?: string,
    public readonly allowedOrigins?: string[],
    public readonly redirectUris?: string[],
    public readonly accessTokenTTL?: string,
    public readonly refreshTokenTTL?: string,
    public readonly isActive?: boolean,
  ) {}
}
