import jwt from 'jsonwebtoken';
import { getOidcSigningKey } from './oidc-keys.js';

const ID_TOKEN_TTL_SECONDS = 15 * 60; // matches the OAuth access token TTL default

/**
 * Only called when the granted scopes include 'openid' (see
 * OAuthTokenService) - an ID Token is an OIDC concept, not a plain OAuth
 * one, and its presence in a token response signals "this exchange also
 * asserts identity," not just "here's an access token."
 */
export function createIdToken(params: {
  issuer: string;
  userId: string;
  clientId: string;
  scopes: string[];
  email?: string;
  emailVerified?: boolean;
  name?: string;
}): string {
  const { privateKey, kid } = getOidcSigningKey();

  const claims: Record<string, unknown> = {
    iss: params.issuer,
    sub: params.userId,
    aud: params.clientId,
  };

  if (params.scopes.includes('email') && params.email) {
    claims.email = params.email;
    claims.email_verified = params.emailVerified ?? false;
  }

  if (params.scopes.includes('profile') && params.name) {
    claims.name = params.name;
  }

  return jwt.sign(claims, privateKey, {
    algorithm: 'RS256',
    expiresIn: ID_TOKEN_TTL_SECONDS,
    keyid: kid,
  });
}
