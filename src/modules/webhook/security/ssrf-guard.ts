import dns from 'dns/promises';
import { isPrivateOrLoopbackAddress } from './url-safety.js';

/**
 * url-safety.ts's check (run at webhook creation/update time) only ever
 * sees a hostname STRING - it can catch "http://localhost" or
 * "http://192.168.1.1" written directly, but a hostname that resolves to
 * a public IP today can be repointed via DNS to a private or cloud
 * metadata IP (169.254.169.254) by the time a delivery actually happens
 * (DNS rebinding). This function is what actually closes that gap: it
 * resolves the hostname IMMEDIATELY BEFORE making the HTTP request,
 * checks every resolved address, and refuses to deliver if any of them
 * land in a private/loopback/link-local range.
 *
 * Called on every single delivery attempt (not just the first), since
 * DNS can change between retries.
 */
export async function assertSafeForDelivery(
  rawUrl: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, reason: 'Webhook URL is no longer a valid URL.' };
  }

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'Webhook URLs must use https in production.' };
  }

  let addresses: { address: string }[];

  try {
    addresses = await dns.lookup(parsed.hostname, { all: true });
  } catch {
    return { ok: false, reason: `Could not resolve hostname "${parsed.hostname}".` };
  }

  if (addresses.length === 0) {
    return { ok: false, reason: `Hostname "${parsed.hostname}" resolved to no addresses.` };
  }

  for (const { address } of addresses) {
    if (isPrivateOrLoopbackAddress(address)) {
      return {
        ok: false,
        reason: `Hostname "${parsed.hostname}" resolved to a private/loopback address (${address}) - blocked.`,
      };
    }
  }

  return { ok: true };
}
