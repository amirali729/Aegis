import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';
import type { IOAuthAccessToken } from '../../model/oauth-access-token.model.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IOAuthAccessTokenRepository {
  create(data: {
    tokenHash: string;
    clientId: string;
    userId: string;
    scopes: string[];
    expiresAt: Date;
  }): Promise<DataResult<IOAuthAccessToken>>;

  findByTokenHash(tokenHash: string): Promise<DataResult<IOAuthAccessToken | null>>;

  revoke(id: string): Promise<DataResult<IOAuthAccessToken | null>>;
}
