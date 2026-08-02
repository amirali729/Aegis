import crypto from 'crypto';

import { err, ok } from '../../../shared/result/result.js';
import { hashToken } from '../../../shared/security/hashing/token-hash.js';
import { InvalidClientError } from '../errors/invalid-client.error.js';
import type { IOAuthClient } from '../model/oauth-client.model.js';
import type { IAuthorizationCodeRepository } from '../repository/interface/authorization-code.repository.interface.js';
import type { IOAuthClientRepository } from '../repository/interface/oauth-client.repository.interface.js';
import type { IOAuthConsentRepository } from '../repository/interface/oauth-consent.repository.interface.js';
import type { AuthorizeOutcome, AuthorizeResult } from '../types/authorize.types.js';
import type { AuthorizeQuery } from '../validation/authorize.schemas.js';
import type { IAuthorizeService } from './interface/authorize.service.interface.js';

const AUTHORIZATION_CODE_TTL_MS = 2 * 60 * 1000; // 2 minutes - RFC 6749 recommends max 10.

type ClientAndScopes = { client: IOAuthClient; requestedScopes: string[] };
type Resolved = { ok: true; value: ClientAndScopes } | { ok: false; result: AuthorizeResult };

export class AuthorizeService implements IAuthorizeService {
  constructor(
    private readonly clientRepository: IOAuthClientRepository,
    private readonly codeRepository: IAuthorizationCodeRepository,
    private readonly consentRepository: IOAuthConsentRepository,
    private readonly clientUrl: string,
  ) {}

  async authorize(
    query: AuthorizeQuery,
    currentUserId: string | undefined,
    originalRequestUrl: string,
  ): Promise<AuthorizeResult> {
    const resolved = await this.resolveClientAndScopes(query);
    if (!resolved.ok) return resolved.result;
    const { client, requestedScopes } = resolved.value;

    if (!currentUserId) {
      const loginUrl = new URL('/login', this.clientUrl);
      loginUrl.searchParams.set('redirect_to', originalRequestUrl);
      return ok({
        type: 'require_login',
        loginUrl: loginUrl.toString(),
      } satisfies AuthorizeOutcome);
    }

    const consent = await this.consentRepository.findOne(currentUserId, client._id.toString());
    const alreadyConsented =
      consent.ok &&
      !!consent.value &&
      requestedScopes.every((scope) => consent.value!.scopes.includes(scope));

    if (!alreadyConsented) {
      // Consent hasn't been given (or covers fewer scopes than this
      // request needs) - send the user to the frontend's consent page
      // instead of issuing a code immediately. Every original request
      // param is preserved in the query string so the consent page can
      // both display what's being requested AND resubmit the exact same
      // parameters to POST /oauth/consent/decision once the user
      // decides - this endpoint is stateless between the redirect here
      // and that follow-up call (no server-side pending-request record;
      // the query string itself carries everything needed).
      const consentUrl = new URL('/oauth/consent', this.clientUrl);
      consentUrl.searchParams.set('client_id', query.client_id);
      consentUrl.searchParams.set('redirect_uri', query.redirect_uri);
      consentUrl.searchParams.set('code_challenge', query.code_challenge);
      consentUrl.searchParams.set('code_challenge_method', query.code_challenge_method);
      if (query.scope) consentUrl.searchParams.set('scope', query.scope);
      if (query.state) consentUrl.searchParams.set('state', query.state);

      return ok({
        type: 'consent_required',
        consentUrl: consentUrl.toString(),
      } satisfies AuthorizeOutcome);
    }

    return this.issueCodeAndRedirect(client, requestedScopes, currentUserId, query);
  }

  async decideConsent(
    query: AuthorizeQuery,
    approved: boolean,
    userId: string,
  ): Promise<AuthorizeResult> {
    const resolved = await this.resolveClientAndScopes(query);
    if (!resolved.ok) return resolved.result;
    const { client, requestedScopes } = resolved.value;

    if (!approved) {
      return this.redirectWithError(
        query,
        'access_denied',
        'The user denied the authorization request.',
      );
    }

    const granted = await this.consentRepository.grantScopes(
      userId,
      client._id.toString(),
      requestedScopes,
    );

    if (!granted.ok) {
      return this.redirectWithError(query, 'server_error', 'Failed to record consent.');
    }

    return this.issueCodeAndRedirect(client, requestedScopes, userId, query);
  }

  /**
   * Validates client_id, redirect_uri (exact match - see
   * authorize.types.ts for why this must happen before anything else),
   * grant type, and requested scope. Shared by both authorize() (the
   * initial GET) and decideConsent() (the POST after the user
   * approves/denies) so the two entry points can never validate this
   * differently from one another.
   */
  private async resolveClientAndScopes(query: AuthorizeQuery): Promise<Resolved> {
    const client = await this.clientRepository.findByClientId(query.client_id);

    if (!client.ok) {
      return { ok: false, result: err(new InvalidClientError()) };
    }

    if (
      !client.value ||
      client.value.status !== 'active' ||
      !client.value.redirectUris.includes(query.redirect_uri)
    ) {
      return { ok: false, result: err(new InvalidClientError()) };
    }

    const oauthClient = client.value;

    if (!oauthClient.grantTypes.includes('authorization_code')) {
      return {
        ok: false,
        result: await this.redirectWithError(
          query,
          'unauthorized_client',
          'This client is not authorized to use the authorization code grant.',
        ),
      };
    }

    const requestedScopes = query.scope
      ? query.scope.split(' ').filter(Boolean)
      : oauthClient.scopes;
    const disallowedScope = requestedScopes.find((scope) => !oauthClient.scopes.includes(scope));

    if (disallowedScope) {
      return {
        ok: false,
        result: await this.redirectWithError(
          query,
          'invalid_scope',
          `Scope "${disallowedScope}" is not granted to this client.`,
        ),
      };
    }

    return { ok: true, value: { client: oauthClient, requestedScopes } };
  }

  private async redirectWithError(
    query: Pick<AuthorizeQuery, 'redirect_uri' | 'state'>,
    errorCode: string,
    description: string,
  ): Promise<AuthorizeResult> {
    const url = new URL(query.redirect_uri);
    url.searchParams.set('error', errorCode);
    url.searchParams.set('error_description', description);
    if (query.state) url.searchParams.set('state', query.state);
    return ok({ type: 'redirect', url: url.toString() });
  }

  private async issueCodeAndRedirect(
    client: IOAuthClient,
    requestedScopes: string[],
    userId: string,
    query: AuthorizeQuery,
  ): Promise<AuthorizeResult> {
    const rawCode = crypto.randomBytes(40).toString('hex');

    const created = await this.codeRepository.create({
      codeHash: hashToken(rawCode),
      clientId: client._id.toString(),
      userId,
      redirectUri: query.redirect_uri,
      scopes: requestedScopes,
      codeChallenge: query.code_challenge,
      expiresAt: new Date(Date.now() + AUTHORIZATION_CODE_TTL_MS),
    });

    if (!created.ok) {
      return this.redirectWithError(
        query,
        'server_error',
        'Failed to issue an authorization code.',
      );
    }

    const url = new URL(query.redirect_uri);
    url.searchParams.set('code', rawCode);
    if (query.state) url.searchParams.set('state', query.state);

    return ok({ type: 'redirect', url: url.toString() });
  }
}
