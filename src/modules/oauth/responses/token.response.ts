/** RFC 6749 section 5.1 - field names are the spec's, not this codebase's usual camelCase convention. */
export class TokenResponse {
  constructor(
    public readonly access_token: string,
    public readonly token_type: 'Bearer',
    public readonly expires_in: number,
    public readonly scope: string,
    public readonly refresh_token?: string,
    /** OIDC Core 1.0 - only present when 'openid' was among the granted scopes. */
    public readonly id_token?: string,
  ) {}
}

/** RFC 7662 section 2.2. */
export class IntrospectionResponse {
  constructor(
    public readonly active: boolean,
    public readonly scope?: string,
    public readonly client_id?: string,
    public readonly username?: string,
    public readonly token_type?: 'access_token' | 'refresh_token',
    public readonly exp?: number,
    public readonly iat?: number,
  ) {}

  static inactive(): IntrospectionResponse {
    return new IntrospectionResponse(false);
  }
}
