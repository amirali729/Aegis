import type { ISession } from '../../model/session.model.js';
import type { Result } from '../../../../shared/result/result.js';
import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface ISessionRepository {
  create(data: {
    userId: string;
    refreshTokenHash: string;
    deviceName: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<DataResult<ISession>>;

  findByRefreshTokenHash(refreshTokenHash: string): Promise<DataResult<ISession | null>>;

  findById(id: string): Promise<DataResult<ISession | null>>;

  /** Active (non-revoked, unexpired) sessions for a user, most recent first. */
  findActiveByUserId(userId: string): Promise<DataResult<ISession[]>>;

  rotate(
    id: string,
    newRefreshTokenHash: string,
    newExpiresAt: Date,
  ): Promise<DataResult<ISession | null>>;

  revoke(id: string): Promise<DataResult<ISession | null>>;

  revokeAllForUser(userId: string): Promise<DataResult<number>>;
}
