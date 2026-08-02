import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';
import type { IOAuthRefreshToken } from '../../model/oauth-refresh-token.model.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IOAuthRefreshTokenRepository {
  create(data: {
    tokenHash: string;
    clientId: string;
    userId: string;
    scopes: string[];
    expiresAt: Date;
  }): Promise<DataResult<IOAuthRefreshToken>>;

  findByTokenHash(tokenHash: string): Promise<DataResult<IOAuthRefreshToken | null>>;

  /** Rotates a refresh token in place - see the model's doc comment. */
  rotate(
    id: string,
    newTokenHash: string,
    newExpiresAt: Date,
  ): Promise<DataResult<IOAuthRefreshToken | null>>;

  revoke(id: string): Promise<DataResult<IOAuthRefreshToken | null>>;
}
