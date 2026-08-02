import type { Result } from '../../../shared/result/result.js';
import { err, ok } from '../../../shared/result/result.js';
import { OAuthTokenError } from '../errors/oauth-token.error.js';
import {
  authorizationCodeGrantSchema,
  introspectRequestSchema,
  refreshTokenGrantSchema,
  revokeRequestSchema,
  SUPPORTED_GRANT_TYPES,
  type TokenRequest,
} from './token.schemas.js';

function firstIssueMessage(issues: { message: string }[]): string {
  return issues[0]?.message ?? 'Malformed request body.';
}

/**
 * Parses a /oauth/token request body into a validated TokenRequest,
 * producing RFC 6749 section 5.2-shaped errors at every failure point -
 * including the specific 'unsupported_grant_type' case (e.g.
 * grant_type: 'client_credentials', which isn't implemented yet), which
 * a generic schema-validation failure can't distinguish from any other
 * malformed request on its own.
 */
export function parseTokenRequest(body: unknown): Result<TokenRequest, OAuthTokenError> {
  if (typeof body !== 'object' || body === null || !('grant_type' in body)) {
    return err(new OAuthTokenError('invalid_request', 'grant_type is required.'));
  }

  const grantType = (body as { grant_type: unknown }).grant_type;

  if (!SUPPORTED_GRANT_TYPES.includes(grantType as (typeof SUPPORTED_GRANT_TYPES)[number])) {
    return err(
      new OAuthTokenError(
        'unsupported_grant_type',
        `grant_type "${String(grantType)}" is not supported. Supported values: ${SUPPORTED_GRANT_TYPES.join(', ')}.`,
      ),
    );
  }

  const schema =
    grantType === 'authorization_code' ? authorizationCodeGrantSchema : refreshTokenGrantSchema;

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return err(new OAuthTokenError('invalid_request', firstIssueMessage(parsed.error.issues)));
  }

  return ok(parsed.data);
}

export function parseRevokeRequest(
  body: unknown,
): Result<ReturnType<typeof revokeRequestSchema.parse>, OAuthTokenError> {
  const parsed = revokeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return err(new OAuthTokenError('invalid_request', firstIssueMessage(parsed.error.issues)));
  }

  return ok(parsed.data);
}

export function parseIntrospectRequest(
  body: unknown,
): Result<ReturnType<typeof introspectRequestSchema.parse>, OAuthTokenError> {
  const parsed = introspectRequestSchema.safeParse(body);

  if (!parsed.success) {
    return err(new OAuthTokenError('invalid_request', firstIssueMessage(parsed.error.issues)));
  }

  return ok(parsed.data);
}
