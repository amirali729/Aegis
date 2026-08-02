import bcrypt from 'bcrypt';

/**
 * For long-lived, high-value secrets that deserve a deliberately slow
 * hash (bcrypt) rather than this codebase's usual fast hashToken()
 * (SHA-256, used for session/API-key/authorization-code tokens - all of
 * which are opaque, high-entropy, short-lived, and looked up by exact
 * hash match in a DB query, where a fast hash is the right trade-off).
 *
 * OAuth client secrets are different: they're a long-lived credential a
 * confidential client re-sends on every token request, and if the
 * clientSecretHash column were ever exfiltrated, a fast hash would be
 * far more brute-forceable than a bcrypt hash of the same value. 12
 * rounds - one step above this codebase's existing bcrypt use for user
 * passwords (10, in modules/auth/model/user.model.ts) - since a client
 * secret is a system credential rather than a user-chosen password
 * balanced against login-latency UX.
 */
const SALT_ROUNDS = 12;

export async function hashSecretSlow(secret: string): Promise<string> {
  return bcrypt.hash(secret, SALT_ROUNDS);
}

export async function verifySecretSlow(secret: string, hash: string): Promise<boolean> {
  return bcrypt.compare(secret, hash);
}
