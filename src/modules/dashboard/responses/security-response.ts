import type { SessionResponse } from '../../session/responses/session.response.js';

export class SecurityResponse {
  constructor(
    public readonly activeSessions: SessionResponse[],
    public readonly activeSessionsCount: number,
    public readonly failedLoginAttempts: number,
    public readonly accountLocked: boolean,
    public readonly lockUntil: Date | undefined,
    public readonly lastLoginAt: Date | undefined,
    public readonly isEmailVerified: boolean,
  ) {}
}
