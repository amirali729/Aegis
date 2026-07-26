import type { HttpClient } from '../http-client.js';
import type { LoginResult, User } from '../types.js';

export interface SignUpInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export class AuthModule {
  private currentUser?: User;

  constructor(private readonly http: HttpClient) {}

  /** Returns the cached user from the last login/signup - no HTTP request. */
  user(): User | undefined {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.http.getTokens().accessToken;
  }

  async signup(input: SignUpInput): Promise<User> {
    const user = await this.http.request<User>('POST', '/auth/signup', { body: input });
    return user;
  }

  async login(input: LoginInput): Promise<User> {
    const result = await this.http.request<LoginResult>('POST', '/auth/login', { body: input });

    this.http.setTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    this.currentUser = result.user;

    return result.user;
  }

  async logout(): Promise<void> {
    try {
      await this.http.request<{ message: string }>('POST', '/auth/logout');
    } finally {
      this.http.clearTokens();
      this.currentUser = undefined;
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await this.http.request<{ message: string }>('POST', '/auth/logoutAll');
    } finally {
      this.http.clearTokens();
      this.currentUser = undefined;
    }
  }

  /** Usually unnecessary - the client refreshes automatically on a 401. */
  async refresh(): Promise<void> {
    const refreshToken = this.http.getTokens().refreshToken;

    const result = await this.http.request<{
      accessToken: string;
      refreshToken: string;
    }>('POST', '/auth/refresh', {
      body: { refreshToken },
      skipAuthRetry: true,
    });

    this.http.setTokens(result);
  }

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await this.http.request('POST', '/auth/changePassword', {
      body: input,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await this.http.request('POST', '/auth/forgotPassword', {
      body: { email },
    });
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    await this.http.request('POST', '/auth/resetPassword', {
      body: input,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await this.http.request('POST', '/auth/verifyEmail', {
      body: { token },
    });
  }

  async resendVerification(email: string): Promise<void> {
    await this.http.request('POST', '/auth/resendVerification', { body: { email } });
  }
}
