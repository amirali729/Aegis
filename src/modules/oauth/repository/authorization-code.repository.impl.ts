import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { IAuthorizationCode } from '../model/authorization-code.model.js';
import { AuthorizationCode } from '../model/authorization-code.model.js';
import type {
  DataResult,
  IAuthorizationCodeRepository,
} from './interface/authorization-code.repository.interface.js';

export class AuthorizationCodeRepository implements IAuthorizationCodeRepository {
  async create(data: {
    codeHash: string;
    clientId: string;
    userId: string;
    redirectUri: string;
    scopes: string[];
    codeChallenge: string;
    expiresAt: Date;
  }): Promise<DataResult<IAuthorizationCode>> {
    try {
      const code = await AuthorizationCode.create({ ...data, codeChallengeMethod: 'S256' });
      return ok(code);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByCodeHash(codeHash: string): Promise<DataResult<IAuthorizationCode | null>> {
    try {
      const code = await AuthorizationCode.findOne({ codeHash });
      return ok(code);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async markUsedAndLinkTokens(
    id: string,
    accessTokenId: string,
    refreshTokenId?: string,
  ): Promise<DataResult<IAuthorizationCode | null>> {
    try {
      const code = await AuthorizationCode.findByIdAndUpdate(
        id,
        {
          used: true,
          issuedAccessTokenId: accessTokenId,
          ...(refreshTokenId ? { issuedRefreshTokenId: refreshTokenId } : {}),
        },
        { new: true },
      );
      return ok(code);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
