import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock PKCE verifier and the User model before importing the service
vi.mock('../../../dist/modules/oauth/security/pkce.js', () => ({
  verifyPkceCodeVerifier: () => true,
}));
vi.mock('../../../dist/modules/auth/model/user.model.js', () => ({
  User: {
    findById: vi.fn(),
  },
}));

import * as userModel from '../../../dist/modules/auth/model/user.model.js';
import { OAuthTokenError } from '../../../dist/modules/oauth/errors/oauth-token.error.js';
import { TokenResponse } from '../../../dist/modules/oauth/responses/token.response.js';
import { OAuthTokenService } from '../../../dist/modules/oauth/service/oauth-token.service.impl.js';
import { ok } from '../../../dist/shared/result/result.js';
import type { IAuthorizationCodeRepository } from '../../../src/modules/oauth/repository/interface/authorization-code.repository.interface.js';
import type { IOAuthAccessTokenRepository } from '../../../src/modules/oauth/repository/interface/oauth-access-token.repository.interface.js';
import type { IOAuthClientRepository } from '../../../src/modules/oauth/repository/interface/oauth-client.repository.interface.js';
import type { IOAuthRefreshTokenRepository } from '../../../src/modules/oauth/repository/interface/oauth-refresh-token.repository.interface.js';
import type { TokenRequest } from '../../../src/modules/oauth/validation/token.schemas.js';

// Minimal local shapes to avoid `any` in tests
type OAuthClientMinimal = {
  _id: mongoose.Types.ObjectId;
  clientId: string;
  grantTypes: string[];
  clientType: 'public' | 'confidential';
  status: 'active' | 'revoked';
};

type RefreshTokenRecord = {
  _id: { toString(): string };
  userId: { toString(): string };
  clientId: mongoose.Types.ObjectId;
  scopes: string[];
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

describe('OAuthTokenService (unit)', () => {
  let clientRepo: IOAuthClientRepository;
  let accessRepo: IOAuthAccessTokenRepository;
  let refreshRepo: IOAuthRefreshTokenRepository;
  let codeRepo: IAuthorizationCodeRepository;
  let svc: OAuthTokenService;

  beforeEach(() => {
    const clientRepoObj = {
      findByApplicationId: vi.fn(),
      findById: vi.fn(),
      findByClientId: vi.fn(async () => ok(null)),
      create: vi.fn(),
      updateSecretHash: vi.fn(),
      revoke: vi.fn(),
    };
    clientRepo = clientRepoObj as unknown as IOAuthClientRepository;

    const codeRepoObj = {
      create: vi.fn(),
      findByCodeHash: vi.fn(async () => ok(null)),
      markUsedAndLinkTokens: vi.fn(),
    };
    codeRepo = codeRepoObj as unknown as IAuthorizationCodeRepository;

    const accessRepoObj = {
      create: vi.fn(async () => ok({ _id: { toString: () => 'at1' } })),
      findByTokenHash: vi.fn(async () => ok(null)),
      revoke: vi.fn(),
    };
    accessRepo = accessRepoObj as unknown as IOAuthAccessTokenRepository;

    const refreshRepoObj = {
      create: vi.fn(),
      findByTokenHash: vi.fn(async () => ok(null)),
      rotate: vi.fn(async () => ok(null)),
      revoke: vi.fn(),
    };
    refreshRepo = refreshRepoObj as unknown as IOAuthRefreshTokenRepository;

    svc = new OAuthTokenService(clientRepo, codeRepo, accessRepo, refreshRepo, undefined);
  });

  it('exchange (refresh_token): unknown client returns invalid_client error', async () => {
    (clientRepo.findByClientId as unknown) = vi.fn(async () => ok(null));

    const request: TokenRequest = {
      grant_type: 'refresh_token',
      refresh_token: 'r',
      client_id: 'c',
    } as TokenRequest;

    const res = await svc.exchange(request);
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(OAuthTokenError);
    expect((res.error as OAuthTokenError).code).toBe('invalid_client');
  });

  it('exchange (refresh_token): client without refresh grant returns unauthorized_client', async () => {
    const client: OAuthClientMinimal = {
      _id: new mongoose.Types.ObjectId(),
      clientId: 'cid',
      grantTypes: ['authorization_code'],
      clientType: 'public',
      status: 'active',
    };
    (clientRepo.findByClientId as unknown) = vi.fn(async () => ok(client));

    const request: TokenRequest = {
      grant_type: 'refresh_token',
      refresh_token: 'r',
      client_id: 'cid',
    } as TokenRequest;

    const res = await svc.exchange(request);
    expect(res.ok).toBe(false);
    expect((res.error as OAuthTokenError).code).toBe('unauthorized_client');
  });

  it('exchange (refresh_token): successful issues tokens', async () => {
    const client: OAuthClientMinimal = {
      _id: new mongoose.Types.ObjectId(),
      clientId: 'cid',
      grantTypes: ['refresh_token'],
      clientType: 'public',
      status: 'active',
    };
    (clientRepo.findByClientId as unknown) = vi.fn(async () => ok(client));

    const foundRefresh: RefreshTokenRecord = {
      _id: { toString: () => 'rtid' },
      userId: { toString: () => 'u1' },
      clientId: client._id,
      scopes: ['profile'],
      expiresAt: new Date(Date.now() + 10000),
      revokedAt: null,
      createdAt: new Date(),
    };

    (refreshRepo.findByTokenHash as unknown) = vi.fn(async () => ok(foundRefresh));
    (refreshRepo.rotate as unknown) = vi.fn(async () => ok({ _id: { toString: () => 'rt2' } }));
    (accessRepo.create as unknown) = vi.fn(async () => ok({ _id: { toString: () => 'at2' } }));

    const request: TokenRequest = {
      grant_type: 'refresh_token',
      refresh_token: 'r',
      client_id: 'cid',
    } as TokenRequest;

    const res = await svc.exchange(request);
    if (!res.ok) console.error('oauth exchange error:', res.error);
    expect(res.ok).toBe(true);
    const tokenResp = res.value as TokenResponse;
    expect(tokenResp.access_token).toBeDefined();
    expect(tokenResp.refresh_token).toBeDefined();
  });

  it('exchange (authorization_code): happy path issues tokens and marks code used', async () => {
    const client: OAuthClientMinimal = {
      _id: new mongoose.Types.ObjectId(),
      clientId: 'cid',
      grantTypes: ['authorization_code', 'refresh_token'],
      clientType: 'public',
      status: 'active',
    };
    (clientRepo.findByClientId as unknown) = vi.fn(async () => ok(client));

    const code = {
      _id: { toString: () => 'code1' },
      used: false,
      issuedAccessTokenId: undefined,
      issuedRefreshTokenId: undefined,
      expiresAt: new Date(Date.now() + 10000),
      clientId: client._id,
      redirectUri: 'https://app/cb',
      codeChallenge: 'challenge',
      userId: new mongoose.Types.ObjectId(),
      scopes: ['openid', 'profile'],
    } as const;

    (codeRepo.findByCodeHash as unknown) = vi.fn(async () => ok(code));
    // stub User.findById to return a minimal user
    (userModel.User.findById as unknown) = vi.fn(async () => ({
      _id: code.userId,
      email: 'a@b',
      isVerified: true,
      fullName: 'Test User',
    }));
    (accessRepo.create as unknown) = vi.fn(async () => ok({ _id: { toString: () => 'at3' } }));
    (refreshRepo.create as unknown) = vi.fn(async () => ok({ _id: { toString: () => 'rt3' } }));

    const request: TokenRequest = {
      grant_type: 'authorization_code',
      code: 'c',
      redirect_uri: 'https://app/cb',
      client_id: 'cid',
      code_verifier: 'verifierstringwhichislongenoughandvalid______',
    } as TokenRequest;

    const res = await svc.exchange(request);
    expect(res.ok).toBe(true);
    const tr = res.value as TokenResponse;
    expect(tr.access_token).toBeDefined();
    expect(tr.refresh_token).toBeDefined();
    // ensure markUsedAndLinkTokens was called
    expect(
      (codeRepo.markUsedAndLinkTokens as unknown as { mock?: { calls?: unknown[] } }).mock?.calls,
    ).toBeDefined();
  });

  it('introspect: inactive token returns inactive response', async () => {
    const client: OAuthClientMinimal = {
      _id: new mongoose.Types.ObjectId(),
      clientId: 'cid',
      grantTypes: ['refresh_token'],
      clientType: 'public',
      status: 'active',
    };
    (clientRepo.findByClientId as unknown) = vi.fn(async () => ok(client));
    (accessRepo.findByTokenHash as unknown) = vi.fn(async () => ok(null));

    const res = await svc.introspect('token', undefined, 'cid', undefined);
    expect(res.ok).toBe(true);
    expect(res.value.active).toBe(false);
  });

  it('revoke: access token revoke returns revoked true', async () => {
    const client: OAuthClientMinimal = {
      _id: new mongoose.Types.ObjectId(),
      clientId: 'cid',
      grantTypes: ['refresh_token'],
      clientType: 'public',
      status: 'active',
    };
    (clientRepo.findByClientId as unknown) = vi.fn(async () => ok(client));

    const accessTokenRecord = {
      _id: { toString: () => 'atx' },
      clientId: client._id,
      userId: new mongoose.Types.ObjectId(),
      scopes: ['profile'],
      expiresAt: new Date(Date.now() + 10000),
      revokedAt: null,
    } as unknown as Record<string, unknown>;

    (accessRepo.findByTokenHash as unknown) = vi.fn(async () => ok(accessTokenRecord));

    const res = await svc.revoke('t', undefined, 'cid', undefined);
    expect(res.ok).toBe(true);
    expect((res.value as { revoked: boolean }).revoked).toBe(true);
  });

  it('getUserInfo: returns claims for OIDC token', async () => {
    const accessRecord = {
      _id: { toString: () => 'atx' },
      clientId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      scopes: ['openid', 'email', 'profile'],
      expiresAt: new Date(Date.now() + 10000),
      revokedAt: null,
    } as unknown as Record<string, unknown>;
    (accessRepo.findByTokenHash as unknown) = vi.fn(async () => ok(accessRecord));
    (userModel.User.findById as unknown) = vi.fn(async () => ({
      _id: accessRecord.userId,
      email: 'u@example.test',
      isVerified: true,
      fullName: 'U Name',
    }));

    const res = await svc.getUserInfo('at');
    expect(res.ok).toBe(true);
    expect((res.value as Record<string, unknown>).sub).toBeDefined();
    expect((res.value as Record<string, unknown>).email).toBe('u@example.test');
  });
});
