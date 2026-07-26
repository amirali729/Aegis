import mongoose from 'mongoose';

import { err, ok } from '../../../shared/result/result.js';
import { ValidationError } from '../../../shared/errors/validation.error.js';
import { hashToken } from '../../../shared/security/hashing/token-hash.js';

import type { IMailer } from '../../email/mailer.interface.js';
import {
  buildPasswordResetEmail,
  buildVerificationEmail,
} from '../../email/templates/auth.mail.js';

import type { IAuthRepository } from '../repository/interface/auth.repository.interface.js';
import type { IAuthService } from './interface/auth.service.interface.js';
import type { IDefaultRoleProvider } from './interface/default-role-provider.interface.js';
import { toUserResponse } from './user.mapper.js';

import type {
  DeviceInfo,
  ISessionService,
} from '../../session/service/interface/session.service.interface.js';
import type { SessionError } from '../../session/types/session.types.js';
import type { IAuditLogger } from '../../audit/service/interface/audit-logger.interface.js';
import { RecordAuditEventDto } from '../../audit/dto/record-audit-event.dto.js';

import type { ChangePasswordDto } from '../dto/change-password.dto.js';
import type { LoginDto } from '../dto/login.dto.js';
import type { SignUpDto } from '../dto/signup.dto.js';
import type { VerifyEmailDto } from '../dto/verify-email.dto.js';
import type { ResendVerificationDto } from '../dto/resend-verification.dto.js';
import type { ForgotPasswordDto } from '../dto/forgot-password.dto.js';
import type { ResetPasswordDto } from '../dto/reset-password.dto.js';

import { EmailAlreadyExistsError } from '../errors/email-already-exists.error.js';
import { UsernameAlreadyExistsError } from '../errors/username-already-exists.error.js';
import { InvalidPasswordError } from '../errors/invalid-password.error.js';
import { InvalidTokenError } from '../errors/invalid-token.error.js';
import { RefreshTokenExpiredError } from '../errors/refresh-token-expired.error.js';
import { UserNotFoundError } from '../errors/user-not-found.error.js';
import { InvalidVerificationTokenError } from '../errors/invalid-verification-token.error.js';
import { InvalidResetTokenError } from '../errors/invalid-reset-token.error.js';

import { ChangePasswordResponse } from '../responses/change-password.response.js';
import { LoginResponse } from '../responses/login.response.js';
import { LogoutResponse } from '../responses/logout.response.js';
import { RefreshTokenResponse } from '../responses/RefreshTokenResponse.js';
import { SignUpResponse } from '../responses/signup.response.js';
import { VerifyEmailResponse } from '../responses/verify-email.response.js';
import { ResendVerificationResponse } from '../responses/resend-verification.response.js';
import { ForgotPasswordResponse } from '../responses/forgot-password.response.js';
import { ResetPasswordResponse } from '../responses/reset-password.response.js';

import type {
  AuthError,
  ChangePasswordResult,
  ForgotPasswordResult,
  LoginResult,
  LogoutResult,
  RefreshTokenResult,
  ResendVerificationResult,
  ResetPasswordResult,
  SignUpResult,
  VerifyEmailResult,
} from '../types/auth.types.js';

export class AuthService implements IAuthService {
  constructor(
    private readonly repository: IAuthRepository,
    private readonly mailer: IMailer,
    private readonly clientUrl: string,
    private readonly sessionService: ISessionService,
    private readonly defaultRoleProvider?: IDefaultRoleProvider,
    private readonly auditLogger?: IAuditLogger,
  ) {}

  async signUp(dto: SignUpDto): Promise<SignUpResult> {
    const existing = await this.repository.findByEmailOrUsername(dto.email, dto.username);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (existing.value) {
      if (existing.value.email === dto.email) {
        return err(new EmailAlreadyExistsError());
      }
      return err(new UsernameAlreadyExistsError());
    }

    const created = await this.repository.createUser(dto);

    if (!created.ok) {
      return err(created.error);
    }

    const user = created.value;

    const defaultRoleId = await this.defaultRoleProvider?.getDefaultRoleId();

    if (defaultRoleId) {
      user.roles.push(new mongoose.Types.ObjectId(defaultRoleId));
    }

    const rawVerificationToken = user.createEmailVerificationToken();

    const saved = await this.repository.save(user, {
      validateBeforeSave: false,
    });

    if (!saved.ok) {
      return err(saved.error);
    }

    await this.mailer.send(
      buildVerificationEmail(
        user.email,
        `${this.clientUrl}/verify-email?token=${rawVerificationToken}`,
      ),
    );

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'auth.signup',
        true,
        user._id.toString(),
        'user',
        'user',
        user._id.toString(),
      ),
    );

    return ok(new SignUpResponse(toUserResponse(saved.value)));
  }

  async login(dto: LoginDto, deviceInfo: DeviceInfo): Promise<LoginResult> {
    const found = await this.repository.findByUsername(dto.username);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      void this.auditLogger?.record(
        new RecordAuditEventDto(
          'auth.login',
          false,
          undefined,
          'user',
          'user',
          undefined,
          deviceInfo.ipAddress,
          deviceInfo.userAgent,
          { reason: 'user_not_found', username: dto.username },
        ),
      );
      return err(new UserNotFoundError());
    }

    const user = found.value;

    const isPasswordCorrect = await user.isPasswordCorrect(dto.password);

    if (!isPasswordCorrect) {
      void this.auditLogger?.record(
        new RecordAuditEventDto(
          'auth.login',
          false,
          user._id.toString(),
          'user',
          'user',
          user._id.toString(),
          deviceInfo.ipAddress,
          deviceInfo.userAgent,
          { reason: 'invalid_password' },
        ),
      );
      return err(new InvalidPasswordError());
    }

    const accessToken = user.generateAccessToken();

    const session = await this.sessionService.createSession(user._id.toString(), deviceInfo);

    if (!session.ok) {
      return err(this.mapSessionError(session.error));
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'auth.login',
        true,
        user._id.toString(),
        'user',
        'user',
        user._id.toString(),
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
      ),
    );

    return ok(new LoginResponse(toUserResponse(user), accessToken, session.value.rawRefreshToken));
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<ChangePasswordResult> {
    if (dto.newPassword !== dto.confirmPassword) {
      return err(new ValidationError('New password and confirm password do not match.'));
    }

    const found = await this.repository.findById(userId);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new UserNotFoundError());
    }

    const user = found.value;

    const isPasswordCorrect = await user.isPasswordCorrect(dto.oldPassword);

    if (!isPasswordCorrect) {
      return err(new InvalidPasswordError());
    }

    user.password = dto.newPassword;

    const saved = await this.repository.save(user);

    if (!saved.ok) {
      return err(saved.error);
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto('auth.password_changed', true, userId, 'user', 'user', userId),
    );

    return ok(new ChangePasswordResponse());
  }

  async logout(userId: string, refreshToken?: string): Promise<LogoutResult> {
    if (refreshToken) {
      const revoked = await this.sessionService.revokeByRefreshToken(refreshToken);

      if (!revoked.ok) {
        return err(this.mapSessionError(revoked.error));
      }
    }

    return ok(new LogoutResponse());
  }

  async logoutAll(userId: string): Promise<LogoutResult> {
    const revoked = await this.sessionService.revokeAllForUser(userId);

    if (!revoked.ok) {
      return err(this.mapSessionError(revoked.error));
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto('auth.logout_all', true, userId, 'user', 'user', userId),
    );

    return ok(new LogoutResponse('Logged out from all devices.'));
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResult> {
    if (!refreshToken) {
      return err(new InvalidTokenError());
    }

    const rotated = await this.sessionService.rotateSession(refreshToken);

    if (!rotated.ok) {
      return err(this.mapSessionError(rotated.error));
    }

    const found = await this.repository.findById(rotated.value.userId);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new UserNotFoundError());
    }

    const accessToken = found.value.generateAccessToken();

    return ok(new RefreshTokenResponse(accessToken, rotated.value.rawRefreshToken));
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<VerifyEmailResult> {
    const tokenHash = hashToken(dto.token);

    const found = await this.repository.findByEmailVerificationTokenHash(tokenHash);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new InvalidVerificationTokenError());
    }

    const user = found.value;

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    const saved = await this.repository.save(user, {
      validateBeforeSave: false,
    });

    if (!saved.ok) {
      return err(saved.error);
    }

    return ok(new VerifyEmailResponse());
  }

  async resendVerification(dto: ResendVerificationDto): Promise<ResendVerificationResult> {
    const found = await this.repository.findByEmail(dto.email);

    if (!found.ok) {
      return err(found.error);
    }

    // Never reveal whether the email exists, and never re-verify an
    // already-verified account - but always return the same generic
    // success response either way to avoid account enumeration.
    if (found.value && !found.value.isVerified) {
      const user = found.value;
      const rawToken = user.createEmailVerificationToken();

      const saved = await this.repository.save(user, {
        validateBeforeSave: false,
      });

      if (!saved.ok) {
        return err(saved.error);
      }

      await this.mailer.send(
        buildVerificationEmail(user.email, `${this.clientUrl}/verify-email?token=${rawToken}`),
      );
    }

    return ok(new ResendVerificationResponse());
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResult> {
    const found = await this.repository.findByEmail(dto.email);

    if (!found.ok) {
      return err(found.error);
    }

    // Same enumeration-safety rationale as resendVerification: always
    // return the same generic message regardless of outcome.
    if (found.value) {
      const user = found.value;
      const rawToken = user.createPasswordResetToken();

      const saved = await this.repository.save(user, {
        validateBeforeSave: false,
      });

      if (!saved.ok) {
        return err(saved.error);
      }

      await this.mailer.send(
        buildPasswordResetEmail(user.email, `${this.clientUrl}/reset-password?token=${rawToken}`),
      );
    }

    return ok(new ForgotPasswordResponse());
  }

  async resetPassword(dto: ResetPasswordDto): Promise<ResetPasswordResult> {
    if (dto.newPassword !== dto.confirmPassword) {
      return err(new ValidationError('New password and confirm password do not match.'));
    }

    const tokenHash = hashToken(dto.token);

    const found = await this.repository.findByPasswordResetTokenHash(tokenHash);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new InvalidResetTokenError());
    }

    const user = found.value;

    if (!user.passwordResetExpiry || user.passwordResetExpiry.getTime() < Date.now()) {
      return err(new InvalidResetTokenError());
    }

    user.password = dto.newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;

    const saved = await this.repository.save(user);

    if (!saved.ok) {
      return err(saved.error);
    }

    // A password reset should also invalidate every existing session,
    // the same way logoutAll does, since the old password (and any
    // stolen refresh token) should no longer be trusted.
    const revoked = await this.sessionService.revokeAllForUser(user._id.toString());

    if (!revoked.ok) {
      return err(this.mapSessionError(revoked.error));
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'auth.password_reset',
        true,
        user._id.toString(),
        'user',
        'user',
        user._id.toString(),
      ),
    );

    return ok(new ResetPasswordResponse());
  }

  /**
   * Translates a SessionError into the equivalent AuthError. Kept as a
   * boundary-crossing step rather than sharing a discriminated union,
   * so the session module has no dependency on the auth module at all
   * (one-directional: auth -> session, never the reverse).
   */
  private mapSessionError(error: SessionError): AuthError {
    switch (error.kind) {
      case 'session_not_found':
      case 'invalid_refresh_token':
        return new InvalidTokenError();
      case 'session_expired':
        return new RefreshTokenExpiredError();
      case 'infrastructure':
        return error;
    }
  }
}
