/**
 * Parses CORS_ORIGIN into a list of exact allowed origins.
 *
 * This API always sends `Access-Control-Allow-Credentials: true` (cookies
 * carry the refresh token), and per the Fetch/CORS spec browsers reject
 * `Access-Control-Allow-Origin: *` whenever credentials are involved -
 * the request will fail silently in every browser even though a
 * server-to-server client (curl, an SDK) would never notice. So `*` is
 * rejected here, at startup, instead of being discovered later as "the
 * frontend can't log in".
 *
 * CORS_ORIGIN must be a comma-separated list of exact origins, e.g.:
 *   CORS_ORIGIN=https://app.example.com,https://admin.example.com
 */
export function parseCorsOrigins(raw: string | undefined): string[] {
  if (!raw || !raw.trim()) {
    throw new Error(
      'CORS_ORIGIN is missing. Set it to a comma-separated list of exact ' +
        'origins allowed to call this API with credentials, e.g. ' +
        'CORS_ORIGIN=https://app.example.com',
    );
  }

  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error('CORS_ORIGIN is set but contains no usable origins.');
  }

  if (origins.includes('*')) {
    throw new Error(
      'CORS_ORIGIN cannot be "*" because this API sends credentials ' +
        '(cookies) with cross-origin requests, and browsers reject ' +
        'Access-Control-Allow-Origin: * whenever ' +
        'Access-Control-Allow-Credentials: true is also set - any ' +
        'browser-based frontend would silently fail to authenticate. ' +
        'Set CORS_ORIGIN to an explicit, comma-separated list of ' +
        'origins instead, e.g. ' +
        'CORS_ORIGIN=https://app.example.com,https://admin.example.com',
    );
  }

  for (const origin of origins) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(
        `CORS_ORIGIN contains an invalid entry: "${origin}". Each entry ` +
          'must be a full origin (scheme + host [+ port]), e.g. ' +
          'https://app.example.com - no path, no trailing slash.',
      );
    }
    if (parsed.pathname !== '/' && parsed.pathname !== '') {
      throw new Error(
        `CORS_ORIGIN entry "${origin}" includes a path. Origins must not ` +
          'have a path, e.g. use https://app.example.com, not ' +
          `${origin}.`,
      );
    }
  }

  return origins;
}
