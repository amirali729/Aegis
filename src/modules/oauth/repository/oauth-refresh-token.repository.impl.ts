import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { IOAuthRefreshToken } from '../model/oauth-refresh-token.model.js';
import { OAuthRefreshToken } from '../model/oauth-refresh-token.model.js';
import type {
  DataResult,
  IOAuthRefreshTokenRepository,
} from './interface/oauth-refresh-token.repository.interface.js';

export class OAuthRefreshTokenRepository implements IOAuthRefreshTokenRepository {
  async create(data: {
    tokenHash: string;
    clientId: string;
    userId: string;
    scopes: string[];
    expiresAt: Date;
  }): Promise<DataResult<IOAuthRefreshToken>> {
    try {
      const token = await OAuthRefreshToken.create(data);
      return ok(token);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByTokenHash(tokenHash: string): Promise<DataResult<IOAuthRefreshToken | null>> {
    try {
      const token = await OAuthRefreshToken.findOne({ tokenHash });
      return ok(token);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async rotate(
    id: string,
    newTokenHash: string,
    newExpiresAt: Date,
  ): Promise<DataResult<IOAuthRefreshToken | null>> {
    try {
      const token = await OAuthRefreshToken.findByIdAndUpdate(
        id,
        { tokenHash: newTokenHash, expiresAt: newExpiresAt },
        { new: true },
      );
      return ok(token);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async revoke(id: string): Promise<DataResult<IOAuthRefreshToken | null>> {
    try {
      const token = await OAuthRefreshToken.findByIdAndUpdate(
        id,
        { revokedAt: new Date() },
        { new: true },
      );
      return ok(token);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
