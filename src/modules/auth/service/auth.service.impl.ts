import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { err, ok } from '../../../shared/result/result.js';
import { ValidationError } from '../../../shared/errors/validation.error.js';
import { hashToken } from '../../../shared/security/hashing/token-hash.js';

import type { IMailer } from '../../email/mailer.interface.js';
// import {
//   buildPasswordResetEmail,
//   buildVerificationEmail,
// } from "../../email/templates/auth-emails.js";
import {
  buildPasswordResetEmail,
  buildVerificationEmail,
} from '../../email/templates/auth.mail.js';

import type { IAuthRepository } from '../repository/interface/auth.repository.interface.js';
import type { IAuthService } from './interface/auth.service.interface.js';
import type { IDefaultRoleProvider } from './interface/default-role-provider.interface.js';
import { generateTokenPair } from './token.service.js';
import { toUserResponse } from './user-mapper.js';

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
import { EmailAlreadyVerifiedError } from '../errors/email-already-verified.error.js';
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
    private readonly defaultRoleProvider?: IDefaultRoleProvider,
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

    return ok(new SignUpResponse(toUserResponse(saved.value)));
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const found = await this.repository.findByUsername(dto.username);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new UserNotFoundError());
    }

    const user = found.value;

    const isPasswordCorrect = await user.isPasswordCorrect(dto.password);

    if (!isPasswordCorrect) {
      return err(new InvalidPasswordError());
    }

    const { accessToken, refreshToken } = await generateTokenPair(user);

    const saved = await this.repository.save(user, {
      validateBeforeSave: false,
    });

    if (!saved.ok) {
      return err(saved.error);
    }

    return ok(new LoginResponse(toUserResponse(saved.value), accessToken, refreshToken));
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

    return ok(new ChangePasswordResponse());
  }

  async logout(userId: string): Promise<LogoutResult> {
    const found = await this.repository.findById(userId);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new UserNotFoundError());
    }

    const user = found.value;
    user.refreshToken = undefined;

    const saved = await this.repository.save(user, {
      validateBeforeSave: false,
    });

    if (!saved.ok) {
      return err(saved.error);
    }

    return ok(new LogoutResponse());
  }

  async logoutAll(userId: string): Promise<LogoutResult> {
    const found = await this.repository.findById(userId);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new UserNotFoundError());
    }

    const user = found.value;
    user.tokenVersion++;
    user.refreshToken = undefined;

    const saved = await this.repository.save(user, {
      validateBeforeSave: false,
    });

    if (!saved.ok) {
      return err(saved.error);
    }

    return ok(new LogoutResponse('Logged out from all devices.'));
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResult> {
    if (!refreshToken) {
      return err(new InvalidTokenError());
    }

    let decoded: { _id: string };

    try {
      decoded = jwt.verify(refreshToken, process.env.ACCESS_REFRESH_SECRET!) as { _id: string };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return err(new RefreshTokenExpiredError());
      }
      return err(new InvalidTokenError());
    }

    const found = await this.repository.findById(decoded._id);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new UserNotFoundError());
    }

    const user = found.value;

    if (user.refreshToken !== refreshToken) {
      return err(new InvalidTokenError());
    }

    const tokens = await generateTokenPair(user);

    const saved = await this.repository.save(user, {
      validateBeforeSave: false,
    });

    if (!saved.ok) {
      return err(saved.error);
    }

    return ok(new RefreshTokenResponse(tokens.accessToken, tokens.refreshToken));
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
    // already-verified account — but always return the same generic
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
    // A password reset should also invalidate every existing session,
    // the same way logoutAll does, since the old password (and any
    // stolen refresh token) should no longer be trusted.
    user.tokenVersion++;
    user.refreshToken = undefined;

    const saved = await this.repository.save(user);

    if (!saved.ok) {
      return err(saved.error);
    }

    return ok(new ResetPasswordResponse());
  }
}
