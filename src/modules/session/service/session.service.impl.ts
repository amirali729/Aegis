import crypto from 'crypto';

import { err, ok } from '../../../shared/result/result.js';
import { hashToken } from '../../../shared/security/hashing/token-hash.js';
import { parseDurationMs } from '../../../shared/utils/duration.js';
import { SessionNotFoundError } from '../errors/session-not-found.error.js';
import { InvalidRefreshTokenError } from '../errors/invalid-refresh-token.error.js';
import { SessionExpiredError } from '../errors/session-expired.error.js';
import type { ISessionRepository } from '../repository/interface/session.repository.interface.js';
import type {
  CreateSessionResult,
  RevokeSessionResult,
  RotateSessionResult,
  SessionListResult,
} from '../types/session.types.js';
import type { DeviceInfo, ISessionService } from './interface/session.service.interface.js';
import { deviceNameFromUserAgent } from './device-name.js';
import { toSessionResponse } from './session.mapper.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function generateRawRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

function refreshTokenTtlMs(): number {
  return parseDurationMs(process.env.ACCESS_REFRESH_EXPIRY ?? '7d', SEVEN_DAYS_MS);
}

export class SessionService implements ISessionService {
  constructor(private readonly repository: ISessionRepository) {}

  async createSession(userId: string, deviceInfo: DeviceInfo): Promise<CreateSessionResult> {
    const rawRefreshToken = generateRawRefreshToken();
    const expiresAt = new Date(Date.now() + refreshTokenTtlMs());

    const created = await this.repository.create({
      userId,
      refreshTokenHash: hashToken(rawRefreshToken),
      deviceName: deviceNameFromUserAgent(deviceInfo.userAgent),
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress,
      expiresAt,
    });

    if (!created.ok) {
      return err(created.error);
    }

    return ok({
      rawRefreshToken,
      session: toSessionResponse(created.value, true),
    });
  }

  async rotateSession(rawRefreshToken: string): Promise<RotateSessionResult> {
    const found = await this.repository.findByRefreshTokenHash(hashToken(rawRefreshToken));

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new InvalidRefreshTokenError());
    }

    if (found.value.expiresAt.getTime() < Date.now()) {
      return err(new SessionExpiredError());
    }

    const newRawRefreshToken = generateRawRefreshToken();
    const newExpiresAt = new Date(Date.now() + refreshTokenTtlMs());

    const rotated = await this.repository.rotate(
      found.value._id.toString(),
      hashToken(newRawRefreshToken),
      newExpiresAt,
    );

    if (!rotated.ok) {
      return err(rotated.error);
    }

    if (!rotated.value) {
      return err(new SessionNotFoundError());
    }

    return ok({
      userId: rotated.value.userId.toString(),
      rawRefreshToken: newRawRefreshToken,
    });
  }

  async listByUser(userId: string, currentRawRefreshToken?: string): Promise<SessionListResult> {
    const found = await this.repository.findActiveByUserId(userId);

    if (!found.ok) {
      return err(found.error);
    }

    const currentHash = currentRawRefreshToken ? hashToken(currentRawRefreshToken) : undefined;

    return ok(
      found.value.map((session) =>
        toSessionResponse(
          session,
          currentHash !== undefined && session.refreshTokenHash === currentHash,
        ),
      ),
    );
  }

  async revokeSession(userId: string, sessionId: string): Promise<RevokeSessionResult> {
    const found = await this.repository.findById(sessionId);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value || found.value.userId.toString() !== userId) {
      return err(new SessionNotFoundError());
    }

    const revoked = await this.repository.revoke(sessionId);

    if (!revoked.ok) {
      return err(revoked.error);
    }

    return ok({ message: 'Session revoked successfully.' });
  }

  async revokeByRefreshToken(rawRefreshToken: string): Promise<RevokeSessionResult> {
    const found = await this.repository.findByRefreshTokenHash(hashToken(rawRefreshToken));

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      // Already gone/revoked - logging out is idempotent either way.
      return ok({ message: 'Logged out.' });
    }

    const revoked = await this.repository.revoke(found.value._id.toString());

    if (!revoked.ok) {
      return err(revoked.error);
    }

    return ok({ message: 'Logged out.' });
  }

  async revokeAllForUser(userId: string): Promise<RevokeSessionResult> {
    const revoked = await this.repository.revokeAllForUser(userId);

    if (!revoked.ok) {
      return err(revoked.error);
    }

    return ok({
      message: `Logged out of ${revoked.value} session(s).`,
    });
  }
}
