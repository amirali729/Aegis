import crypto from 'crypto';

export function generateClientId(): string {
  return `client_${crypto.randomBytes(12).toString('hex')}`;
}

export function generateClientSecret(): string {
  return `secret_${crypto.randomBytes(32).toString('hex')}`;
}

export function generateApiKey(): {
  rawKey: string;
  keyPrefix: string;
} {
  const rawKey = `sk_${crypto.randomBytes(24).toString('hex')}`;
  const keyPrefix = rawKey.slice(0, 12);
  return { rawKey, keyPrefix };
}
