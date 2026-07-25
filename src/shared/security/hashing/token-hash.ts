import crypto from 'crypto';

/**
 * Hashes a raw, single-use token (email verification / password reset)
 * before it is persisted.
 *
 * Raw tokens are only ever transmitted to the user (via email link).
 * The database only ever stores the hash, so a database leak alone
 * can never be used to impersonate a user or reset their password.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}
