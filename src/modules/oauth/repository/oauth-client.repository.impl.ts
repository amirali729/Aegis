import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { IOAuthClient } from '../model/oauth-client.model.js';
import { OAuthClient } from '../model/oauth-client.model.js';
import type {
  DataResult,
  IOAuthClientRepository,
} from './interface/oauth-client.repository.interface.js';

export class OAuthClientRepository implements IOAuthClientRepository {
  async findByApplicationId(applicationId: string): Promise<DataResult<IOAuthClient[]>> {
    try {
      const clients = await OAuthClient.find({ applicationId }).sort({ createdAt: -1 });
      return ok(clients);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findById(id: string): Promise<DataResult<IOAuthClient | null>> {
    try {
      const client = await OAuthClient.findById(id);
      return ok(client);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByClientId(clientId: string): Promise<DataResult<IOAuthClient | null>> {
    try {
      const client = await OAuthClient.findOne({ clientId });
      return ok(client);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async create(data: {
    applicationId: string;
    name: string;
    clientId: string;
    clientSecretHash?: string;
    clientType: 'confidential' | 'public';
    redirectUris: string[];
    grantTypes: string[];
    scopes: string[];
  }): Promise<DataResult<IOAuthClient>> {
    try {
      const client = await OAuthClient.create(data);
      return ok(client);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async updateSecretHash(
    id: string,
    clientSecretHash: string,
  ): Promise<DataResult<IOAuthClient | null>> {
    try {
      const client = await OAuthClient.findByIdAndUpdate(id, { clientSecretHash }, { new: true });
      return ok(client);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async revoke(id: string): Promise<DataResult<IOAuthClient | null>> {
    try {
      const client = await OAuthClient.findByIdAndUpdate(id, { status: 'revoked' }, { new: true });
      return ok(client);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
