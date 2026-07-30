import { parseCorsOrigins } from './cors-origins.js';

/**
 * Values that ship as examples in .env.example / Docker/*.env.example
 * files. If any of these are still in place at startup, the app is
 * running with a guessable/known secret - which is arguably worse than
 * a missing one, since it fails silently instead of loudly. Checked
 * case-insensitively.
 */
const PLACEHOLDER_VALUES = new Set(
  [
    'changeme-access-secret',
    'changeme-refresh-secret',
    'accesstokensecret',
    'refreshtokensecret',
    'changeme',
    'secret',
    'your-secret-here',
    'your-secret',
    'replace-me',
    'replaceme',
  ].map((v) => v.toLowerCase()),
);

interface RequiredVar {
  name: string;
  /** Extra checks beyond "present and not a placeholder". Return an error string, or undefined if OK. */
  check?: (value: string) => string | undefined;
}

const MIN_SECRET_LENGTH = 16;

function minLengthCheck(value: string): string | undefined {
  if (value.length < MIN_SECRET_LENGTH) {
    return `is only ${value.length} characters long; use a random value of at least ${MIN_SECRET_LENGTH} characters (e.g. \`openssl rand -hex 32\`)`;
  }
  return undefined;
}

const REQUIRED_VARS: RequiredVar[] = [
  { name: 'MONGODB_URI' },
  { name: 'ACCESS_TOKEN_SECRET', check: minLengthCheck },
  { name: 'ACCESS_TOKEN_EXPIRY' },
  { name: 'ACCESS_REFRESH_EXPIRY' },
  { name: 'CLIENT_URL' },
  {
    name: 'CORS_ORIGIN',
    check: (value) => {
      try {
        parseCorsOrigins(value);
        return undefined;
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    },
  },
];

/**
 * Fails fast at boot with a single, clear, actionable message listing
 * every problem found, instead of letting the app start with missing
 * config (which then surfaces as a confusing crash deep inside a
 * request handler) or a guessable placeholder secret (which starts up
 * fine and silently runs insecurely).
 *
 * Intentionally throws rather than calling process.exit itself, so
 * callers (and tests) can decide how to handle the failure.
 */
export function validateEnv(): void {
  const problems: string[] = [];

  for (const { name, check } of REQUIRED_VARS) {
    const value = process.env[name];

    if (!value || !value.trim()) {
      problems.push(`  - ${name} is missing.`);
      continue;
    }

    if (PLACEHOLDER_VALUES.has(value.trim().toLowerCase())) {
      problems.push(
        `  - ${name} is still set to a placeholder/example value ("${value}"). Set a real, unique value.`,
      );
      continue;
    }

    const checkError = check?.(value);
    if (checkError) {
      problems.push(`  - ${name} ${checkError}`);
    }
  }

  if (process.env.MULTI_TENANT && !['true', 'false'].includes(process.env.MULTI_TENANT)) {
    problems.push('  - MULTI_TENANT must be either "true" or "false" if set.');
  }

  if (problems.length > 0) {
    throw new Error(
      `Refusing to start: invalid or missing environment configuration:\n${problems.join('\n')}\n\n` +
        'See .env.example (or Docker/development|production/.env.example) for the full list of required variables.',
    );
  }
}
