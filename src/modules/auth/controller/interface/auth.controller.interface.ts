import type { Request, Response, NextFunction } from 'express';
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
} from '../../types/auth.types.js';

export interface IAuthController {
  signUp(req: Request, res: Response, next: NextFunction): Promise<SignUpResult>;

  login(req: Request, res: Response, next: NextFunction): Promise<LoginResult>;

  changePassword(req: Request, res: Response, next: NextFunction): Promise<ChangePasswordResult>;

  logout(req: Request, res: Response, next: NextFunction): Promise<LogoutResult>;

  refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<RefreshTokenResult>;

  logoutAll(req: Request, res: Response, next: NextFunction): Promise<LogoutResult>;

  verifyEmail(req: Request, res: Response, next: NextFunction): Promise<VerifyEmailResult>;

  resendVerification(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<ResendVerificationResult>;

  forgotPassword(req: Request, res: Response, next: NextFunction): Promise<ForgotPasswordResult>;

  resetPassword(req: Request, res: Response, next: NextFunction): Promise<ResetPasswordResult>;
}
