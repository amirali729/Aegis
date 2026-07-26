import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { IApiKey } from '../model/api-key.model.js';
import { ApiKey } from '../model/api-key.model.js';
import type { DataResult, IApiKeyRepository } from './interface/apikey.repository.interface.js';

export class ApiKeyRepository implements IApiKeyRepository {
  async findByApplicationId(applicationId: string): Promise<DataResult<IApiKey[]>> {
    try {
      const apiKeys = await ApiKey.find({
        applicationId,
      }).sort({ createdAt: -1 });
      return ok(apiKeys);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findById(id: string): Promise<DataResult<IApiKey | null>> {
    try {
      const apiKey = await ApiKey.findById(id);
      return ok(apiKey);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByHashedKey(hashedKey: string): Promise<DataResult<IApiKey | null>> {
    try {
      const apiKey = await ApiKey.findOne({ hashedKey });
      return ok(apiKey);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async create(data: {
    applicationId: string;
    name: string;
    keyPrefix: string;
    hashedKey: string;
    expiresAt?: Date;
  }): Promise<DataResult<IApiKey>> {
    try {
      const apiKey = await ApiKey.create(data);
      return ok(apiKey);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async revoke(id: string): Promise<DataResult<IApiKey | null>> {
    try {
      const apiKey = await ApiKey.findByIdAndUpdate(id, { status: 'revoked' }, { new: true });
      return ok(apiKey);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async touchLastUsed(id: string): Promise<DataResult<void>> {
    try {
      await ApiKey.findByIdAndUpdate(id, {
        lastUsedAt: new Date(),
      });
      return ok(undefined);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
