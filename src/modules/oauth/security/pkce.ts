import crypto from 'crypto';

/**
 * RFC 7636: code_challenge = BASE64URL(SHA256(code_verifier)). Only the
 * S256 method is supported anywhere in this module (see
 * validation/authorize.schemas.ts) - "plain" is deliberately rejected at
 * the /oauth/authorize step already, so this function never needs to
 * handle it.
 */
export function verifyPkceCodeVerifier(codeVerifier: string, codeChallenge: string): boolean {
  const computedChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  // Fixed-length values (both are base64url SHA-256 digests) - safe to
  // compare with timingSafeEqual without a length check first.
  const a = Buffer.from(computedChallenge);
  const b = Buffer.from(codeChallenge);

  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}
