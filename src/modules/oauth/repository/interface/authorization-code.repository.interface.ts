import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';
import type { IAuthorizationCode } from '../../model/authorization-code.model.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IAuthorizationCodeRepository {
  create(data: {
    codeHash: string;
    clientId: string;
    userId: string;
    redirectUri: string;
    scopes: string[];
    codeChallenge: string;
    expiresAt: Date;
  }): Promise<DataResult<IAuthorizationCode>>;

  findByCodeHash(codeHash: string): Promise<DataResult<IAuthorizationCode | null>>;

  markUsedAndLinkTokens(
    id: string,
    accessTokenId: string,
    refreshTokenId?: string,
  ): Promise<DataResult<IAuthorizationCode | null>>;
}
