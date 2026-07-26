import type { NextFunction, Request, Response } from 'express';

import type { IAuthService } from '../service/interface/auth.service.interface.js';
import type { IAuthController } from './interface/auth.controller.interface.js';

import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { ForgotPasswordDto } from '../dto/forgot-password.dto.js';
import { LoginDto } from '../dto/login.dto.js';
import { ResendVerificationDto } from '../dto/resend-verification.dto.js';
import { ResetPasswordDto } from '../dto/reset-password.dto.js';
import { SignUpDto } from '../dto/signup.dto.js';
import { VerifyEmailDto } from '../dto/verify-email.dto.js';

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

import { err } from '../../../shared/result/result.js';
import { InvalidTokenError } from '../errors/invalid-token.error.js';

import { clearAuthCookies, setAuthCookies } from '../../../shared/http/cookies.js';

export class AuthController implements IAuthController {
  constructor(private readonly service: IAuthService) {}

  async signUp(req: Request, _res: Response, _next: NextFunction): Promise<SignUpResult> {
    const dto = new SignUpDto(req.body.username, req.body.email, req.body.password);

    return this.service.signUp(dto);
  }

  async login(req: Request, res: Response, _next: NextFunction): Promise<LoginResult> {
    const dto = new LoginDto(req.body.username, req.body.password);

    const result = await this.service.login(dto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    if (!result.ok) {
      return result;
    }

    setAuthCookies(res, result.value.accessToken, result.value.refreshToken);

    return result;
  }

  async changePassword(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<ChangePasswordResult> {
    const dto = new ChangePasswordDto(
      req.body.oldPassword,
      req.body.newPassword,
      req.body.confirmPassword,
    );

    return this.service.changePassword(req.user._id.toString(), dto);
  }

  async logout(req: Request, res: Response, _next: NextFunction): Promise<LogoutResult> {
    const result = await this.service.logout(req.user._id.toString(), req.cookies?.refreshToken);

    if (!result.ok) {
      return result;
    }

    clearAuthCookies(res);

    return result;
  }

  async refreshAccessToken(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<RefreshTokenResult> {
    const refreshToken = req.body?.refreshToken ?? req.cookies?.refreshToken;

    if (!refreshToken) {
      return err(new InvalidTokenError());
    }

    const result = await this.service.refreshAccessToken(refreshToken);

    if (!result.ok) {
      return result;
    }

    setAuthCookies(res, result.value.accessToken, result.value.refreshToken);

    return result;
  }

  async logoutAll(req: Request, res: Response, _next: NextFunction): Promise<LogoutResult> {
    const result = await this.service.logoutAll(req.user._id.toString());

    if (!result.ok) {
      return result;
    }

    clearAuthCookies(res);

    return result;
  }

  async verifyEmail(req: Request, _res: Response, _next: NextFunction): Promise<VerifyEmailResult> {
    const dto = new VerifyEmailDto(req.body.token ?? req.query.token);

    return this.service.verifyEmail(dto);
  }

  async resendVerification(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<ResendVerificationResult> {
    const dto = new ResendVerificationDto(req.body.email);

    return this.service.resendVerification(dto);
  }

  async forgotPassword(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<ForgotPasswordResult> {
    const dto = new ForgotPasswordDto(req.body.email);

    return this.service.forgotPassword(dto);
  }

  async resetPassword(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<ResetPasswordResult> {
    const dto = new ResetPasswordDto(
      req.body.token,
      req.body.newPassword,
      req.body.confirmPassword,
    );

    return this.service.resetPassword(dto);
  }
}
