import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { IOAuthAccessToken } from '../model/oauth-access-token.model.js';
import { OAuthAccessToken } from '../model/oauth-access-token.model.js';
import type {
  DataResult,
  IOAuthAccessTokenRepository,
} from './interface/oauth-access-token.repository.interface.js';

export class OAuthAccessTokenRepository implements IOAuthAccessTokenRepository {
  async create(data: {
    tokenHash: string;
    clientId: string;
    userId: string;
    scopes: string[];
    expiresAt: Date;
  }): Promise<DataResult<IOAuthAccessToken>> {
    try {
      const token = await OAuthAccessToken.create(data);
      return ok(token);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByTokenHash(tokenHash: string): Promise<DataResult<IOAuthAccessToken | null>> {
    try {
      const token = await OAuthAccessToken.findOne({ tokenHash });
      return ok(token);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async revoke(id: string): Promise<DataResult<IOAuthAccessToken | null>> {
    try {
      const token = await OAuthAccessToken.findByIdAndUpdate(
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
