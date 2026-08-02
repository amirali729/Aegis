import type { ErrorShape } from '../../../shared/errors/error.shape.js';

export type OAuthErrorCode =
  | 'invalid_request'
  | 'invalid_client'
  | 'invalid_grant'
  | 'unauthorized_client'
  | 'unsupported_grant_type'
  | 'invalid_scope'
  | 'server_error';

/**
 * Unlike every other error class in this codebase, this one is shaped to
 * be serialized directly per RFC 6749 section 5.2 ({ error,
 * error_description }), not through BaseErrorResponse's internal
 * envelope - /oauth/token, /oauth/revoke, and /oauth/introspect are
 * consumed by third-party OAuth client libraries that parse the
 * standard shape, not this API's own conventions. See
 * controller/token.controller.impl.ts for where that serialization
 * happens.
 */
export class OAuthTokenError implements ErrorShape {
  readonly kind = 'oauth_token_error';
  readonly timestamp = new Date();

  constructor(
    public readonly code: OAuthErrorCode,
    public readonly message: string,
    public readonly httpStatus: 400 | 401 = 400,
  ) {}
}
