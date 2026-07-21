import type {
  Request,
  Response,
  NextFunction,
} from "express";

import type { IAuthController } from "./interface/auth.controller.interface.js";
import type { IAuthRepository } from "../repository/interface/auth.repository.interface.js";

import { SignUpDto } from "../dto/signup.dto.js";
import { LoginDto } from "../dto/login.dto.js";
import { ChangePasswordDto } from "../dto/change-password.dto.js";

import {
  SignUpResult,
  LoginResult,
  ChangePasswordResult,
  LogoutResult,
  RefreshTokenResult,
} from "../types/auth.types.js";

import { ValidationError } from "../../../shared/errors/validation.error.js";
import { InvalidTokenError } from "../errors/invalid-token.error.js";
import { err } from "../../../shared/result/result.js";


import {
  setAuthCookies,
  clearAuthCookies,
} from "../../../shared/http/cookies.js";

export class AuthController implements IAuthController {
  constructor(
    private readonly repository: IAuthRepository
  ) {}

  async signUp(
    req: Request,
    _res: Response,
    _next: NextFunction
  ): Promise<SignUpResult> {
    const dto = new SignUpDto(
      req.body.username,
      req.body.email,
      req.body.password
    );

    return this.repository.signUp(dto);
  }

  async login(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<LoginResult> {
    const dto = new LoginDto(
      req.body.username,
      req.body.password
    );

    const result =
      await this.repository.login(dto);

    if (!result.ok) {
      return result;
    }

    setAuthCookies(
      res,
      result.value.accessToken,
      result.value.refreshToken
    );

    return result;
  }

  async changePassword(
    req: Request,
    _res: Response,
    _next: NextFunction
  ): Promise<ChangePasswordResult> {
    const dto = new ChangePasswordDto(
      req.body.oldPassword,
      req.body.newPassword,
      req.body.confirmPassword
    );

    if (dto.newPassword !== dto.confirmPassword) {
      return err(
        new ValidationError(
          "New password and confirm password do not match."
        )
      );
    }

    return this.repository.changePassword(
      req.user._id.toString(),
      dto
    );
  }

  async logout(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<LogoutResult> {
    const result =
      await this.repository.logout(
        req.user._id.toString()
      );

    if (!result.ok) {
      return result;
    }

    clearAuthCookies(res);

    return result;
  }

  async refreshAccessToken(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<RefreshTokenResult> {
    const refreshToken =
      req.cookies?.refreshToken;

    if (!refreshToken) {
      return err(
        new InvalidTokenError()
      );
    }

    const result =
      await this.repository.refreshAccessToken(
        refreshToken
      );

    if (!result.ok) {
      return result;
    }

    setAuthCookies(
      res,
      result.value.accessToken,
      result.value.refreshToken
    );

    return result;
  }

  async logoutAll(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<LogoutResult> {
    const result =
      await this.repository.logoutAll(
        req.user._id.toString()
      );

    if (!result.ok) {
      return result;
    }

    clearAuthCookies(res);

    return result;
  }
}