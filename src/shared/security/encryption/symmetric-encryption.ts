import crypto from 'crypto';

/**
 * AES-256-GCM encrypt/decrypt for secrets that must be RECOVERABLE, not
 * just verifiable. Every other secret in this codebase (passwords,
 * client secrets, API keys, session/OAuth tokens) only ever needs
 * one-way comparison - hash it, compare hashes, done - so they use
 * hashToken()/hashSecretSlow() and can never be read back. A webhook
 * signing secret is different: the delivery worker (Phase 3c) must
 * compute an HMAC-SHA256 signature over EVERY outgoing request body
 * using the ORIGINAL secret value, which means the original value has
 * to be reconstructable from what's stored in the database. Hashing
 * would make that impossible by design - so this uses authenticated
 * encryption instead, which is reversible with the right key.
 *
 * GCM is an authenticated mode - decrypt() fails loudly (throws) if the
 * ciphertext was tampered with, rather than silently returning garbage.
 *
 * Key source, same priority pattern as oidc-keys.ts:
 *  1. WEBHOOK_SECRET_ENCRYPTION_KEY - a 32-byte key, base64-encoded.
 *     Required in production - every server process must share the same
 *     key, or a webhook secret encrypted by one process can't be
 *     decrypted by another.
 *  2. A generated-at-boot ephemeral key, ONLY as a local-development
 *     fallback (mirrors the ConsoleMailer/OIDC-key fallback pattern) -
 *     secrets encrypted with it become unrecoverable the moment the
 *     process restarts, which would break every existing webhook's
 *     signing. Fine for local testing, never acceptable in production.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended IV length for GCM

function loadEncryptionKey(): Buffer {
  const configured = process.env.WEBHOOK_SECRET_ENCRYPTION_KEY;

  if (configured) {
    const key = Buffer.from(configured, 'base64');
    if (key.length !== 32) {
      throw new Error(
        'WEBHOOK_SECRET_ENCRYPTION_KEY must decode to exactly 32 bytes (AES-256) - generate one with `openssl rand -base64 32`.',
      );
    }
    return key;
  }

  console.warn(
    '[WARN] WEBHOOK_SECRET_ENCRYPTION_KEY not set - generating an ephemeral encryption key for ' +
      'webhook signing secrets. This key is lost on every restart - every existing webhook secret ' +
      'becomes undecryptable (and therefore unusable for signing deliveries) after a restart. Set ' +
      'WEBHOOK_SECRET_ENCRYPTION_KEY in production.',
  );

  return crypto.randomBytes(32);
}

const encryptionKey = loadEncryptionKey();

/** Returns `${iv}:${authTag}:${ciphertext}`, all base64 - a single string safe to store in one DB field. */
export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(
    ':',
  );
}

/** Throws if the ciphertext is malformed or has been tampered with (GCM authentication failure). */
export function decryptSecret(stored: string): string {
  const [ivB64, authTagB64, ciphertextB64] = stored.split(':');
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error('Malformed encrypted secret - expected "iv:authTag:ciphertext".');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
