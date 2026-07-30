import type { DeviceInfo } from '../../../session/service/interface/session.service.interface.js';
import type { ChangePasswordDto } from '../../dto/change-password.dto.js';
import type { ForgotPasswordDto } from '../../dto/forgot-password.dto.js';
import type { LoginDto } from '../../dto/login.dto.js';
import type { ResendVerificationDto } from '../../dto/resend-verification.dto.js';
import type { ResetPasswordDto } from '../../dto/reset-password.dto.js';
import type { SignUpDto } from '../../dto/signup.dto.js';
import type { VerifyEmailDto } from '../../dto/verify-email.dto.js';

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

export interface IAuthService {
  signUp(dto: SignUpDto, tenantId?: string): Promise<SignUpResult>;

  login(dto: LoginDto, deviceInfo: DeviceInfo, tenantId?: string): Promise<LoginResult>;

  changePassword(userId: string, dto: ChangePasswordDto): Promise<ChangePasswordResult>;

  logout(userId: string, refreshToken?: string): Promise<LogoutResult>;

  logoutAll(userId: string): Promise<LogoutResult>;

  refreshAccessToken(refreshToken: string): Promise<RefreshTokenResult>;

  verifyEmail(dto: VerifyEmailDto): Promise<VerifyEmailResult>;

  resendVerification(dto: ResendVerificationDto): Promise<ResendVerificationResult>;

  forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResult>;

  resetPassword(dto: ResetPasswordDto): Promise<ResetPasswordResult>;
}
