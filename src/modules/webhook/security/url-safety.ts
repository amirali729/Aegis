/**
 * A coarse, string-level check applied when a webhook URL is
 * registered/updated - rejects the most obvious cases (localhost,
 * loopback/private IP literals, non-http(s) schemes) up front so a
 * customer gets immediate feedback instead of silently registering a
 * webhook that can never deliver.
 *
 * This is explicitly NOT sufficient SSRF protection on its own, and
 * must not be treated as the security boundary: a hostname that resolves
 * to a public IP right now can be repointed (DNS rebinding) to a private
 * or cloud-metadata IP by the time the delivery worker actually makes
 * the request. Real SSRF protection has to happen at DELIVERY time,
 * immediately before the HTTP request is made, by resolving the
 * hostname and validating the resulting IP - that's Phase 3c's job (the
 * Webhook Dispatcher / delivery worker), not this creation-time check.
 * This function only exists to catch obviously-wrong input early.
 */
const BLOCKED_HOSTNAMES = new Set(['localhost', '0.0.0.0']);

const PRIVATE_IP_PATTERNS: RegExp[] = [
  /^127\./, // loopback
  /^10\./, // private
  /^172\.(1[6-9]|2\d|3[01])\./, // private
  /^192\.168\./, // private
  /^169\.254\./, // link-local (includes cloud metadata endpoints, e.g. 169.254.169.254)
  /^::1$/, // IPv6 loopback
  /^fc00:/i, // IPv6 unique local
  /^fe80:/i, // IPv6 link-local
];

export function validateWebhookUrl(rawUrl: string): { ok: true } | { ok: false; reason: string } {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, reason: 'Must be a valid URL.' };
  }

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'Webhook URLs must use https in production.' };
  }

  if (!isProduction && !['https:', 'http:'].includes(parsed.protocol)) {
    return { ok: false, reason: 'Webhook URLs must use http or https.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { ok: false, reason: 'Webhook URLs cannot point at localhost.' };
  }

  if (PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(hostname))) {
    return { ok: false, reason: 'Webhook URLs cannot point at a private or loopback IP address.' };
  }

  return { ok: true };
}
