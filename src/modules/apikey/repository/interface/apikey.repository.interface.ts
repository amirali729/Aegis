import type { IApiKey } from '../../model/api-key.model.js';
import type { Result } from '../../../../shared/result/result.js';
import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IApiKeyRepository {
  findByApplicationId(applicationId: string): Promise<DataResult<IApiKey[]>>;

  findById(id: string): Promise<DataResult<IApiKey | null>>;

  findByHashedKey(hashedKey: string): Promise<DataResult<IApiKey | null>>;

  create(data: {
    applicationId: string;
    name: string;
    keyPrefix: string;
    hashedKey: string;
    expiresAt?: Date;
  }): Promise<DataResult<IApiKey>>;

  revoke(id: string): Promise<DataResult<IApiKey | null>>;

  touchLastUsed(id: string): Promise<DataResult<void>>;
}
