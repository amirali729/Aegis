import type { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import type { ValidationError } from '../../../shared/errors/validation.error.js';
import type { Result } from '../../../shared/result/result.js';
import type { InvalidClientError } from '../errors/invalid-client.error.js';

export type { InvalidClientError };

/**
 * 'require_login', 'consent_required', and 'redirect' all leave this
 * service as Ok - every one of them is safe because by the time any is
 * produced, client_id and redirect_uri have already been validated
 * against the OAuthClient's registered redirectUris (exact match).
 * Errors that occur AFTER that point (bad scope, PKCE issues) are still
 * represented as Ok with type 'redirect' - per RFC 6749 they're
 * delivered to the client via its own redirect_uri (?error=...), not
 * thrown as a direct HTTP error.
 *
 * Only errors that occur BEFORE redirect_uri can be trusted (unknown
 * client_id, redirect_uri not registered for this client) are modeled as
 * Err - these must be shown directly, never redirected, or the endpoint
 * becomes an open redirect.
 */
export type AuthorizeOutcome =
  | { type: 'require_login'; loginUrl: string }
  | { type: 'consent_required'; consentUrl: string }
  | { type: 'redirect'; url: string };

export type AuthorizeError = InvalidClientError | ValidationError | InfrastructureError;

export type AuthorizeResult = Result<AuthorizeOutcome, AuthorizeError>;
