import crypto from 'crypto';

/**
 * Signs `${timestamp}.${rawBody}` (not just rawBody alone) - the same
 * approach Stripe/GitHub use. Folding the timestamp into what's signed
 * is what REPLAY PROTECTION actually means here: Aegis is the sender,
 * not the receiver, so "replay protection" is a capability this
 * function hands to the customer's endpoint, not something enforced on
 * this side. A customer verifying a delivery should recompute this same
 * signature using their stored secret and the X-Aegis-Timestamp header,
 * AND reject the request if that timestamp is too old (e.g. more than 5
 * minutes) - the timestamp being signed (not just present) is what
 * stops an attacker from replaying a captured, validly-signed request
 * indefinitely; without it, a captured signature+body pair would remain
 * valid forever.
 */
export function computeWebhookSignature(
  secret: string,
  timestampSeconds: number,
  rawBody: string,
): string {
  return crypto.createHmac('sha256', secret).update(`${timestampSeconds}.${rawBody}`).digest('hex');
}
