import crypto from 'crypto';

/**
 * ID Tokens (OIDC Core 1.0) must be verifiable by third-party clients
 * WITHOUT access to any Aegis secret - that's the entire point of an ID
 * Token vs. this codebase's existing access-token JWTs
 * (verifyJwt.middleware.ts), which are HS256/symmetric and only ever
 * verified by Aegis itself. That requires an asymmetric keypair (RS256):
 * Aegis signs with the private key, and publishes the public key at
 * /.well-known/jwks.json (see routes/discovery.routes.ts) for any client
 * to verify against independently.
 *
 * ROTATION SUPPORT: JWKS is meant to be able to publish more than one
 * key at once, specifically so a key can be rotated without breaking
 * verification of tokens signed moments before the rotation - a client
 * that cached the old JWKS response (per its own cache-control headers)
 * needs the old key to still resolve until it refetches. This module
 * supports exactly that: a LIST of keys, all published in JWKS, with
 * ONE explicitly designated as "current" (used for all NEW signing).
 * Keys are looked up by "kid" - every signed ID Token stamps the kid of
 * whichever key signed it (see id-token.ts), so a verifier picks the
 * right JWKS entry even with several published at once.
 *
 * Key source, in priority order:
 *  1. OAUTH_JWT_KEYS - a JSON array of { kid, privateKey, publicKey }
 *     (PEM, with literal "\n" sequences), e.g.:
 *       [{"kid":"2026-01","privateKey":"...","publicKey":"..."},
 *        {"kid":"2025-07","privateKey":"...","publicKey":"..."}]
 *     The FIRST entry in the array is always the current signing key;
 *     every entry (including the first) is published in JWKS. To
 *     rotate: prepend a newly generated key, keep the old one(s) in the
 *     array for as long as your cache-control/JWKS TTL requires clients
 *     to still be able to fetch it, then drop it in a later deploy.
 *  2. OAUTH_JWT_PRIVATE_KEY / OAUTH_JWT_PUBLIC_KEY (single-key form,
 *     backward-compatible with pre-rotation-support deployments) +
 *     OAUTH_JWT_KID (defaults to a fixed value if unset).
 *  3. A generated-at-boot ephemeral keypair, ONLY as a local-development
 *     fallback - mirrors the existing ConsoleMailer fallback pattern
 *     (email/mailer.factory.ts) of "warn loudly, keep working locally."
 *     Tokens signed with an ephemeral key stop verifying the moment the
 *     process restarts (a new key is generated every boot) - this is
 *     fine for local testing, never acceptable in production.
 */

interface SigningKey {
  kid: string;
  privateKey: crypto.KeyObject;
  publicKey: crypto.KeyObject;
}

let keys: SigningKey[];

function loadFromKeyList(): boolean {
  const raw = process.env.OAUTH_JWT_KEYS;
  if (!raw) return false;

  let parsed: Array<{ kid: string; privateKey: string; publicKey: string }>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('[ERROR] OAUTH_JWT_KEYS is not valid JSON - falling back to other key sources.');
    return false;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return false;

  keys = parsed.map((entry) => ({
    kid: entry.kid,
    privateKey: crypto.createPrivateKey(entry.privateKey.replace(/\\n/g, '\n')),
    publicKey: crypto.createPublicKey(entry.publicKey.replace(/\\n/g, '\n')),
  }));

  return true;
}

function loadSingleFromEnv(): boolean {
  const privatePem = process.env.OAUTH_JWT_PRIVATE_KEY;
  const publicPem = process.env.OAUTH_JWT_PUBLIC_KEY;

  if (!privatePem || !publicPem) return false;

  keys = [
    {
      kid: process.env.OAUTH_JWT_KID ?? 'aegis-oidc-default',
      privateKey: crypto.createPrivateKey(privatePem.replace(/\\n/g, '\n')),
      publicKey: crypto.createPublicKey(publicPem.replace(/\\n/g, '\n')),
    },
  ];

  return true;
}

function generateEphemeral(): void {
  console.warn(
    '[WARN] Neither OAUTH_JWT_KEYS nor OAUTH_JWT_PRIVATE_KEY/OAUTH_JWT_PUBLIC_KEY is set - ' +
      'generating an ephemeral RSA keypair for ID Token signing. This key is lost on every ' +
      'restart and differs across server processes - ID Tokens will fail to verify after a ' +
      'restart or behind a multi-process/load-balanced deployment. Set OAUTH_JWT_KEYS in production.',
  );

  const generated = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  keys = [{ kid: 'ephemeral', privateKey: generated.privateKey, publicKey: generated.publicKey }];
}

if (!loadFromKeyList() && !loadSingleFromEnv()) {
  generateEphemeral();
}

/** The key used to sign every NEW ID Token - always keys[0]. */
export function getOidcSigningKey(): { privateKey: crypto.KeyObject; kid: string } {
  const current = keys[0]!;
  return { privateKey: current.privateKey, kid: current.kid };
}

/** Every published key, current and rotated-out-but-still-verifiable, for /.well-known/jwks.json. */
export function getOidcJwks(): Record<string, unknown>[] {
  return keys.map((key) => {
    const jwk = key.publicKey.export({ format: 'jwk' }) as Record<string, unknown>;
    return { ...jwk, use: 'sig', alg: 'RS256', kid: key.kid };
  });
}
