import crypto from 'crypto';

import { User } from '../../../modules/auth/model/user.model.js';
import type { Result } from '../../../shared/result/result.js';
import { err, ok } from '../../../shared/result/result.js';
import { hashToken } from '../../../shared/security/hashing/token-hash.js';
import { parseDurationMs } from '../../../shared/utils/duration.js';
import { OAuthTokenError } from '../errors/oauth-token.error.js';
import type { IOAuthClient } from '../model/oauth-client.model.js';
import type { IAuthorizationCodeRepository } from '../repository/interface/authorization-code.repository.interface.js';
import type { IOAuthAccessTokenRepository } from '../repository/interface/oauth-access-token.repository.interface.js';
import type { IOAuthClientRepository } from '../repository/interface/oauth-client.repository.interface.js';
import type { IOAuthRefreshTokenRepository } from '../repository/interface/oauth-refresh-token.repository.interface.js';
import { IntrospectionResponse, TokenResponse } from '../responses/token.response.js';
import { verifyPkceCodeVerifier } from '../security/pkce.js';
import type { TokenRequest } from '../validation/token.schemas.js';
import type {
  IntrospectResult,
  IOAuthTokenService,
  RevokeResult,
  TokenResult,
} from './interface/oauth-token.service.interface.js';

const ACCESS_TOKEN_TTL_MS = parseDurationMs(
  process.env.OAUTH_ACCESS_TOKEN_TTL ?? '15m',
  15 * 60 * 1000,
);
const REFRESH_TOKEN_TTL_MS = parseDurationMs(
  process.env.OAUTH_REFRESH_TOKEN_TTL ?? '30d',
  30 * 24 * 60 * 60 * 1000,
);

function generateRawToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

export class OAuthTokenService implements IOAuthTokenService {
  constructor(
    private readonly clientRepository: IOAuthClientRepository,
    private readonly codeRepository: IAuthorizationCodeRepository,
    private readonly accessTokenRepository: IOAuthAccessTokenRepository,
    private readonly refreshTokenRepository: IOAuthRefreshTokenRepository,
  ) {}

  async exchange(request: TokenRequest): Promise<TokenResult> {
    if (request.grant_type === 'authorization_code') {
      return this.exchangeAuthorizationCode(request);
    }

    return this.exchangeRefreshToken(request);
  }

  private async exchangeAuthorizationCode(
    request: Extract<TokenRequest, { grant_type: 'authorization_code' }>,
  ): Promise<TokenResult> {
    const clientResult = await this.authenticateClient(request.client_id, request.client_secret);
    if (!clientResult.ok) return err(clientResult.error);
    const client = clientResult.value;

    if (!client.grantTypes.includes('authorization_code')) {
      return err(
        new OAuthTokenError(
          'unauthorized_client',
          'This client is not authorized to use the authorization_code grant.',
        ),
      );
    }

    const found = await this.codeRepository.findByCodeHash(hashToken(request.code));

    if (!found.ok) {
      return err(new OAuthTokenError('server_error', 'Failed to look up authorization code.'));
    }

    if (!found.value) {
      return err(new OAuthTokenError('invalid_grant', 'Invalid or expired authorization code.'));
    }

    const code = found.value;

    // NOTE: a reused code is a strong signal of a stolen/replayed code
    // (RFC 6749 section 10.5 recommends revoking every token previously
    // issued from it). AuthorizationCode doesn't currently link forward
    // to the tokens it issued, so that cascade isn't implemented yet -
    // this rejects the reuse, but doesn't (yet) revoke anything already
    // issued from the first, legitimate use. Flagged as follow-up work,
    // not silently skipped.
    if (
      code.used ||
      code.expiresAt.getTime() < Date.now() ||
      code.clientId.toString() !== client._id.toString() ||
      code.redirectUri !== request.redirect_uri
    ) {
      return err(new OAuthTokenError('invalid_grant', 'Invalid or expired authorization code.'));
    }

    if (!verifyPkceCodeVerifier(request.code_verifier, code.codeChallenge)) {
      return err(new OAuthTokenError('invalid_grant', 'PKCE verification failed.'));
    }

    await this.codeRepository.markUsed(code._id.toString());

    const user = await User.findById(code.userId);
    if (!user) {
      return err(new OAuthTokenError('invalid_grant', 'The authorizing user no longer exists.'));
    }

    return this.issueTokens(client, user._id.toString(), code.scopes);
  }

  private async exchangeRefreshToken(
    request: Extract<TokenRequest, { grant_type: 'refresh_token' }>,
  ): Promise<TokenResult> {
    const clientResult = await this.authenticateClient(request.client_id, request.client_secret);
    if (!clientResult.ok) return err(clientResult.error);
    const client = clientResult.value;

    if (!client.grantTypes.includes('refresh_token')) {
      return err(
        new OAuthTokenError(
          'unauthorized_client',
          'This client is not authorized to use the refresh_token grant.',
        ),
      );
    }

    const found = await this.refreshTokenRepository.findByTokenHash(
      hashToken(request.refresh_token),
    );

    if (!found.ok) {
      return err(new OAuthTokenError('server_error', 'Failed to look up refresh token.'));
    }

    if (
      !found.value ||
      found.value.revokedAt ||
      found.value.expiresAt.getTime() < Date.now() ||
      found.value.clientId.toString() !== client._id.toString()
    ) {
      return err(
        new OAuthTokenError('invalid_grant', 'Invalid, expired, or revoked refresh token.'),
      );
    }

    const newRawRefreshToken = generateRawToken();
    const newRefreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    const rotated = await this.refreshTokenRepository.rotate(
      found.value._id.toString(),
      hashToken(newRawRefreshToken),
      newRefreshExpiresAt,
    );

    if (!rotated.ok || !rotated.value) {
      return err(new OAuthTokenError('server_error', 'Failed to rotate refresh token.'));
    }

    const rawAccessToken = generateRawToken();
    const accessExpiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS);

    const createdAccessToken = await this.accessTokenRepository.create({
      tokenHash: hashToken(rawAccessToken),
      clientId: client._id.toString(),
      userId: found.value.userId.toString(),
      scopes: found.value.scopes,
      expiresAt: accessExpiresAt,
    });

    if (!createdAccessToken.ok) {
      return err(new OAuthTokenError('server_error', 'Failed to issue an access token.'));
    }

    return ok(
      new TokenResponse(
        rawAccessToken,
        'Bearer',
        Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
        found.value.scopes.join(' '),
        newRawRefreshToken,
      ),
    );
  }

  private async issueTokens(
    client: IOAuthClient,
    userId: string,
    scopes: string[],
  ): Promise<TokenResult> {
    const rawAccessToken = generateRawToken();
    const accessExpiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS);

    const createdAccessToken = await this.accessTokenRepository.create({
      tokenHash: hashToken(rawAccessToken),
      clientId: client._id.toString(),
      userId,
      scopes,
      expiresAt: accessExpiresAt,
    });

    if (!createdAccessToken.ok) {
      return err(new OAuthTokenError('server_error', 'Failed to issue an access token.'));
    }

    let rawRefreshToken: string | undefined;

    if (client.grantTypes.includes('refresh_token')) {
      rawRefreshToken = generateRawToken();
      const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

      const createdRefreshToken = await this.refreshTokenRepository.create({
        tokenHash: hashToken(rawRefreshToken),
        clientId: client._id.toString(),
        userId,
        scopes,
        expiresAt: refreshExpiresAt,
      });

      if (!createdRefreshToken.ok) {
        return err(new OAuthTokenError('server_error', 'Failed to issue a refresh token.'));
      }
    }

    return ok(
      new TokenResponse(
        rawAccessToken,
        'Bearer',
        Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
        scopes.join(' '),
        rawRefreshToken,
      ),
    );
  }

  async revoke(
    token: string,
    tokenTypeHint: 'access_token' | 'refresh_token' | undefined,
    clientId: string,
    clientSecret: string | undefined,
  ): Promise<RevokeResult> {
    const clientResult = await this.authenticateClient(clientId, clientSecret);
    if (!clientResult.ok) return err(clientResult.error);
    const client = clientResult.value;

    const tokenHash = hashToken(token);

    // RFC 7009 section 2.2: the authorization server responds 200
    // whether or not the token existed/was already revoked - this
    // deliberately doesn't distinguish "not found" from "revoked" in its
    // response, to avoid leaking token validity to a caller who only
    // needs to know their own revocation request succeeded.
    if (tokenTypeHint !== 'refresh_token') {
      const found = await this.accessTokenRepository.findByTokenHash(tokenHash);
      if (found.ok && found.value && found.value.clientId.toString() === client._id.toString()) {
        await this.accessTokenRepository.revoke(found.value._id.toString());
        return ok({ revoked: true });
      }
    }

    const found = await this.refreshTokenRepository.findByTokenHash(tokenHash);
    if (found.ok && found.value && found.value.clientId.toString() === client._id.toString()) {
      await this.refreshTokenRepository.revoke(found.value._id.toString());
    }

    return ok({ revoked: true });
  }

  async introspect(
    token: string,
    tokenTypeHint: 'access_token' | 'refresh_token' | undefined,
    clientId: string,
    clientSecret: string | undefined,
  ): Promise<IntrospectResult> {
    const clientResult = await this.authenticateClient(clientId, clientSecret);
    if (!clientResult.ok) return err(clientResult.error);
    const client = clientResult.value;

    const tokenHash = hashToken(token);

    if (tokenTypeHint !== 'refresh_token') {
      const found = await this.accessTokenRepository.findByTokenHash(tokenHash);

      if (
        found.ok &&
        found.value &&
        !found.value.revokedAt &&
        found.value.expiresAt.getTime() > Date.now() &&
        found.value.clientId.toString() === client._id.toString()
      ) {
        return ok(await this.buildActiveIntrospection(found.value, client, 'access_token'));
      }
    }

    const found = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (
      found.ok &&
      found.value &&
      !found.value.revokedAt &&
      found.value.expiresAt.getTime() > Date.now() &&
      found.value.clientId.toString() === client._id.toString()
    ) {
      return ok(await this.buildActiveIntrospection(found.value, client, 'refresh_token'));
    }

    return ok(IntrospectionResponse.inactive());
  }

  private async buildActiveIntrospection(
    token: { userId: { toString(): string }; scopes: string[]; expiresAt: Date; createdAt: Date },
    client: IOAuthClient,
    tokenType: 'access_token' | 'refresh_token',
  ): Promise<IntrospectionResponse> {
    const user = await User.findById(token.userId).select('email');

    return new IntrospectionResponse(
      true,
      token.scopes.join(' '),
      client.clientId,
      user?.email,
      tokenType,
      Math.floor(token.expiresAt.getTime() / 1000),
      Math.floor(token.createdAt.getTime() / 1000),
    );
  }

  private async authenticateClient(
    clientId: string,
    clientSecret: string | undefined,
  ): Promise<Result<IOAuthClient, OAuthTokenError>> {
    const found = await this.clientRepository.findByClientId(clientId);

    if (!found.ok) {
      return err(new OAuthTokenError('server_error', 'Failed to look up client.'));
    }

    if (!found.value || found.value.status !== 'active') {
      return err(new OAuthTokenError('invalid_client', 'Unknown or inactive client.', 401));
    }

    if (found.value.clientType === 'confidential') {
      if (!clientSecret || hashToken(clientSecret) !== found.value.clientSecretHash) {
        return err(new OAuthTokenError('invalid_client', 'Invalid client credentials.', 401));
      }
    }

    return ok(found.value);
  }
}
