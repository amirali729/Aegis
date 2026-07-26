import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { ISession } from '../model/session.model.js';
import { Session } from '../model/session.model.js';
import type { DataResult, ISessionRepository } from './interface/session.repository.interface.js';

export class SessionRepository implements ISessionRepository {
  async create(data: {
    userId: string;
    refreshTokenHash: string;
    deviceName: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<DataResult<ISession>> {
    try {
      const session = await Session.create(data);
      return ok(session);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByRefreshTokenHash(refreshTokenHash: string): Promise<DataResult<ISession | null>> {
    try {
      const session = await Session.findOne({
        refreshTokenHash,
        revokedAt: { $exists: false },
      });
      return ok(session);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findById(id: string): Promise<DataResult<ISession | null>> {
    try {
      const session = await Session.findById(id);
      return ok(session);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findActiveByUserId(userId: string): Promise<DataResult<ISession[]>> {
    try {
      const sessions = await Session.find({
        userId,
        revokedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      }).sort({ lastActiveAt: -1 });
      return ok(sessions);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async rotate(
    id: string,
    newRefreshTokenHash: string,
    newExpiresAt: Date,
  ): Promise<DataResult<ISession | null>> {
    try {
      const session = await Session.findByIdAndUpdate(
        id,
        {
          refreshTokenHash: newRefreshTokenHash,
          expiresAt: newExpiresAt,
          lastActiveAt: new Date(),
        },
        { new: true },
      );
      return ok(session);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async revoke(id: string): Promise<DataResult<ISession | null>> {
    try {
      const session = await Session.findByIdAndUpdate(id, { revokedAt: new Date() }, { new: true });
      return ok(session);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async revokeAllForUser(userId: string): Promise<DataResult<number>> {
    try {
      const result = await Session.updateMany(
        { userId, revokedAt: { $exists: false } },
        { revokedAt: new Date() },
      );
      return ok(result.modifiedCount);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
