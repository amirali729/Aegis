import type { Result } from '../../../../shared/result/result.js';
import type { OAuthTokenError } from '../../errors/oauth-token.error.js';
import type { IntrospectionResponse, TokenResponse } from '../../responses/token.response.js';
import type { TokenRequest } from '../../validation/token.schemas.js';

export type TokenResult = Result<TokenResponse, OAuthTokenError>;
export type RevokeResult = Result<{ revoked: true }, OAuthTokenError>;
export type IntrospectResult = Result<IntrospectionResponse, OAuthTokenError>;

export type UserInfoResult = Result<Record<string, unknown>, OAuthTokenError>;

export interface IOAuthTokenService {
  exchange(request: TokenRequest): Promise<TokenResult>;

  revoke(
    token: string,
    tokenTypeHint: 'access_token' | 'refresh_token' | undefined,
    clientId: string,
    clientSecret: string | undefined,
  ): Promise<RevokeResult>;

  introspect(
    token: string,
    tokenTypeHint: 'access_token' | 'refresh_token' | undefined,
    clientId: string,
    clientSecret: string | undefined,
  ): Promise<IntrospectResult>;

  /** OIDC UserInfo endpoint (GET /oauth/userinfo) - resolves claims from a bare access token, no client auth involved (the token itself is the credential). */
  getUserInfo(accessToken: string): Promise<UserInfoResult>;
}
