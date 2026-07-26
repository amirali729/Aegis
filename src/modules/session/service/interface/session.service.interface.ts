import type {
  CreateSessionResult,
  RevokeSessionResult,
  RotateSessionResult,
  SessionListResult,
} from '../../types/session.types.js';

export interface DeviceInfo {
  userAgent?: string;
  ipAddress?: string;
}

export interface ISessionService {
  createSession(userId: string, deviceInfo: DeviceInfo): Promise<CreateSessionResult>;

  /**
   * Verifies a raw refresh token and rotates it (issues a new one,
   * invalidating the old one) in a single step.
   */
  rotateSession(rawRefreshToken: string): Promise<RotateSessionResult>;

  listByUser(userId: string, currentRawRefreshToken?: string): Promise<SessionListResult>;

  revokeSession(userId: string, sessionId: string): Promise<RevokeSessionResult>;

  revokeByRefreshToken(rawRefreshToken: string): Promise<RevokeSessionResult>;

  revokeAllForUser(userId: string): Promise<RevokeSessionResult>;
}
