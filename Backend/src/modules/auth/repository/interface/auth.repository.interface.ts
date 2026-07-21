import { SignUpDto } from "../../dto/signup.dto.js";
import { LoginDto } from "../../dto/login.dto.js";
import { ChangePasswordDto } from "../../dto/change-password.dto.js";

import type {
  SignUpResult,
  LoginResult,
  ChangePasswordResult,
  LogoutResult,
  RefreshTokenResult,
} from "../../types/auth.types.js";

export interface IAuthRepository {
  signUp(dto: SignUpDto): Promise<SignUpResult>;

  login(dto: LoginDto): Promise<LoginResult>;

  changePassword(
    userId: string,
    dto: ChangePasswordDto
  ): Promise<ChangePasswordResult>;

  logout(userId: string): Promise<LogoutResult>;

  refreshAccessToken(
  refreshToken: string
): Promise<RefreshTokenResult>;

logoutAll(userId: string): Promise<LogoutResult>
}