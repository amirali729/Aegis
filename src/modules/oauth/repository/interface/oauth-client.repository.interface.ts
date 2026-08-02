import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';
import type { IOAuthClient } from '../../model/oauth-client.model.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IOAuthClientRepository {
  findByApplicationId(applicationId: string): Promise<DataResult<IOAuthClient[]>>;

  findById(id: string): Promise<DataResult<IOAuthClient | null>>;

  findByClientId(clientId: string): Promise<DataResult<IOAuthClient | null>>;

  create(data: {
    applicationId: string;
    name: string;
    clientId: string;
    clientSecretHash?: string;
    clientType: 'confidential' | 'public';
    redirectUris: string[];
    grantTypes: string[];
    scopes: string[];
  }): Promise<DataResult<IOAuthClient>>;

  updateSecretHash(id: string, clientSecretHash: string): Promise<DataResult<IOAuthClient | null>>;

  revoke(id: string): Promise<DataResult<IOAuthClient | null>>;
}
