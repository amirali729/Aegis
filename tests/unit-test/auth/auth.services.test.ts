import { beforeEach, describe, expect, it, vi } from 'vitest';

import mongoose from 'mongoose';
import { LoginDto } from '../../../dist/modules/auth/dto/login.dto.js';
import { SignUpDto } from '../../../dist/modules/auth/dto/signup.dto.js';
import { AccountLockedError } from '../../../dist/modules/auth/errors/account-locked.error.js';
import { EmailAlreadyExistsError } from '../../../dist/modules/auth/errors/email-already-exists.error.js';
import { InvalidCredentialsError } from '../../../dist/modules/auth/errors/invalid-credentials.error.js';
import { InvalidTokenError } from '../../../dist/modules/auth/errors/invalid-token.error.js';
import { UsernameAlreadyExistsError } from '../../../dist/modules/auth/errors/username-already-exists.error.js';
import type { IUser } from '../../../dist/modules/auth/model/user.model.js';
import type { IAuthRepository } from '../../../dist/modules/auth/repository/interface/auth.repository.interface.js';
import { LoginResponse } from '../../../dist/modules/auth/responses/login.response.js';
import type { IMailer } from '../../../dist/modules/email/mailer.interface.js';
import type { ISessionService } from '../../../dist/modules/session/service/interface/session.service.interface.js';
import { InfrastructureError } from '../../../dist/shared/errors/infrastructure.error.js';
import { err, ok } from '../../../dist/shared/result/result.js';

vi.mock('../../../dist/shared/security/authorization/permission-evaluator.js', () => ({
  getUserPermissionKeys: vi.fn(async () => []),
  expandPermissionKeysForClient: vi.fn(async () => []),
}));

describe('AuthService (unit)', () => {
  let repo: IAuthRepository;
  let mailer: IMailer;
  let sessionService: ISessionService;
  let svc: AuthService;

  beforeEach(async () => {
    repo = {
      findByEmail: vi.fn(async () => ok(null)),
      findByUsername: vi.fn(async () => ok(null)),
      findByEmailOrUsername: vi.fn(async () => ok(null)),
      findById: vi.fn(async () => ok(null)),
      findByEmailVerificationTokenHash: vi.fn(async () => ok(null)),
      findByPasswordResetTokenHash: vi.fn(async () => ok(null)),
      createUser: vi.fn(),
      save: vi.fn(),
    } as unknown as IAuthRepository;

    mailer = { send: vi.fn(async () => true) } as unknown as IMailer;

    sessionService = {
      createSession: vi.fn(async () => ok({ rawRefreshToken: 'r', userId: 'u1' })),
      revokeByRefreshToken: vi.fn(async () => ok(true)),
      revokeAllForUser: vi.fn(async () => ok(true)),
      rotateSession: vi.fn(async () => ok({ rawRefreshToken: 'r', userId: 'u1' })),
    } as unknown as ISessionService;

    const mod = await import('../../../dist/modules/auth/service/auth.service.impl.js');
    const AuthServiceMod = mod.AuthService;
    svc = new AuthServiceMod(repo, mailer, 'http://client.test', sessionService, undefined);
  });

  it('signUp: happy path sends verification and returns SignUpResponse', async () => {
    const newUser = {
      _id: { toString: () => 'u1' },
      createEmailVerificationToken: () => 'tok',
    } as unknown as IUser;
    (repo.findByEmailOrUsername as unknown) = vi.fn(async () => ok(null));
    (repo.createUser as unknown) = vi.fn(async () => ok(newUser));
    (repo.save as unknown) = vi.fn(async () => ok(newUser));

    const dto = new SignUpDto('alice', 'alice@example.test', 'password');
    const res = await svc.signUp(dto);
    expect(res.ok).toBe(true);
  });

  it('signUp: email already exists returns EmailAlreadyExistsError', async () => {
    const existing = { email: 'a@x' } as unknown as IUser;
    (repo.findByEmail as unknown) = vi.fn(async () => ok(existing));
    (repo.findByEmailOrUsername as unknown) = vi.fn(async () => ok(existing));

    const dto = new SignUpDto('u', 'a@x', 'p');
    const res = await svc.signUp(dto);
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(EmailAlreadyExistsError);
  });

  it('signUp: username already exists returns UsernameAlreadyExistsError', async () => {
    const existing = { email: 'other@x', username: 'u' } as unknown as IUser;
    (repo.findByEmailOrUsername as unknown) = vi.fn(async () => ok(existing));

    const dto = new SignUpDto('u', 'x@x', 'p');
    const res = await svc.signUp(dto);
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(UsernameAlreadyExistsError);
  });

  it('signUp: repository infrastructure error propagates', async () => {
    (repo.findByEmailOrUsername as unknown) = vi.fn(async () => err(new InfrastructureError('db')));
    const dto = new SignUpDto('x', 'y', 'p');
    const res = await svc.signUp(dto);
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(InfrastructureError);
  });

  it('login: user not found returns InvalidCredentialsError', async () => {
    (repo.findByUsername as unknown) = vi.fn(async () => ok(null));
    const dto = new LoginDto('noone', 'pw');
    const res = await svc.login(dto, { ipAddress: '1', userAgent: 'ua' });
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(InvalidCredentialsError);
  });

  it('login: account locked returns AccountLockedError', async () => {
    const user = {
      isLocked: () => true,
    } as unknown as IUser;
    (repo.findByUsername as unknown) = vi.fn(async () => ok(user));
    const dto = new LoginDto('u', 'p');
    const res = await svc.login(dto, { ipAddress: '1', userAgent: 'ua' });
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(AccountLockedError);
  });

  it('login: wrong password registers failed login and returns InvalidCredentialsError', async () => {
    const user = {
      isLocked: () => false,
      isPasswordCorrect: async () => false,
      registerFailedLogin: async () => {},
      _id: { toString: () => 'u1' },
    } as unknown as IUser;
    (repo.findByUsername as unknown) = vi.fn(async () => ok(user));
    const dto = new LoginDto('u', 'bad');
    const res = await svc.login(dto, { ipAddress: '1', userAgent: 'ua' });
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(InvalidCredentialsError);
  });

  it('login: successful returns LoginResponse with tokens', async () => {
    const user = {
      isLocked: () => false,
      isPasswordCorrect: async () => true,
      registerSuccessfulLogin: async () => {},
      generateAccessToken: () => 'at',
      _id: new mongoose.Types.ObjectId(),
      username: 'u',
    } as unknown as IUser;
    (repo.findByUsername as unknown) = vi.fn(async () => ok(user));
    (sessionService.createSession as unknown) = vi.fn(async () =>
      ok({ rawRefreshToken: 'rt', userId: 'u1' } as { rawRefreshToken: string; userId: string }),
    );

    // Stub permission evaluator to avoid DB access
    const perm =
      await import('../../../dist/shared/security/authorization/permission-evaluator.js');
    (perm.getUserPermissionKeys as unknown) = vi.fn(async () => []);
    (perm.expandPermissionKeysForClient as unknown) = vi.fn(async () => []);

    const dto = new LoginDto('u', 'good');
    const res = await svc.login(dto, { ipAddress: '1', userAgent: 'ua' });
    expect(res.ok).toBe(true);
    expect(res.value).toBeInstanceOf(LoginResponse);
  });

  it('refreshAccessToken: missing token returns InvalidTokenError', async () => {
    const res = await svc.refreshAccessToken('');
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(InvalidTokenError);
  });

  it('refreshAccessToken: session rotate infrastructure error propagates', async () => {
    (sessionService.rotateSession as unknown) = vi.fn(async () =>
      err(new InfrastructureError('db')),
    );
    const res = await svc.refreshAccessToken('rt');
    expect(res.ok).toBe(false);
    expect(res.error).toBeInstanceOf(InfrastructureError);
  });

  it('refreshAccessToken: user not found returns UserNotFoundError', async () => {
    (sessionService.rotateSession as unknown) = vi.fn(async () =>
      ok({ rawRefreshToken: 'r', userId: 'missing' } as {
        rawRefreshToken: string;
        userId: string;
      }),
    );
    (repo.findById as unknown) = vi.fn(async () => ok(null));
    const res = await svc.refreshAccessToken('rt');
    expect(res.ok).toBe(false);
    expect((res.error as unknown as { kind?: string }).kind).toBe('user_not_found');
  });
});
