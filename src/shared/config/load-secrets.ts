import fs from 'fs';

/**
 * Env vars that are allowed to be supplied indirectly via a `${NAME}_FILE`
 * pointer (the convention used by Docker secrets / Kubernetes secret
 * volume mounts, e.g. the official Postgres and MongoDB images). This
 * lets production deployments keep real secret values out of the
 * process environment/compose file entirely and instead mount them as
 * files (e.g. /run/secrets/access_token_secret).
 *
 * Only listed here because these are the values that are genuinely
 * secret; non-secret config (PORT, CORS_ORIGIN, ...) is not included.
 */
const SECRET_ENV_VARS = [
  'ACCESS_TOKEN_SECRET',
  'ACCESS_REFRESH_SECRET',
  'MONGODB_URI',
  'SMTP_PASS',
] as const;

/**
 * For each var in SECRET_ENV_VARS, if `${NAME}_FILE` is set and `NAME`
 * itself is not already set directly, reads the file and assigns its
 * (trimmed) contents to process.env[NAME]. Must run before
 * validate-env's checks. Safe to call in every environment - it's a
 * no-op unless a *_FILE var is actually present.
 */
export function loadSecretsFromFiles(): void {
  for (const name of SECRET_ENV_VARS) {
    const filePath = process.env[`${name}_FILE`];

    if (!filePath) continue;

    if (process.env[name]) {
      // Direct value already wins to keep local/dev overrides simple;
      // don't silently clobber it with the file's contents.
      continue;
    }

    try {
      process.env[name] = fs.readFileSync(filePath, 'utf-8').trim();
    } catch (error) {
      // Project targets ES2020, which doesn't have Error.cause - the
      // original error's message is folded into this one instead.
      // eslint-disable-next-line preserve-caught-error
      throw new Error(
        `Failed to read secret file for ${name} at "${filePath}" ` +
          `(from ${name}_FILE): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
