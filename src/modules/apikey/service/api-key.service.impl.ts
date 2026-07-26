import { err, ok } from '../../../shared/result/result.js';
import { hashToken } from '../../../shared/security/hashing/token-hash.js';
import { ApplicationNotFoundError } from '../../application/errors/application-not-found.error.js';
import type { IApplicationRepository } from '../../application/repository/interface/application.repository.interface.js';
import { generateApiKey } from '../../application/service/credential-generator.js';
import type { CreateApiKeyDto } from '../dto/create-api-key.dto.js';
import { ApiKeyNotFoundError } from '../errors/api-key-not-found.error.js';
import { InvalidApiKeyError } from '../errors/invalid-api-key.error.js';
import type { IApiKeyRepository } from '../repository/interface/apikey.repository.interface.js';
import { ApiKeyCreatedResponse } from '../responses/api-key-created.response.js';
import type {
  ApiKeyCreatedResult,
  ApiKeyListResult,
  RevokeApiKeyResult,
  VerifyApiKeyResult,
} from '../types/api-key.types.js';
import { toApiKeyResponse } from './api-key.mapper.js';
import type { IApiKeyService } from './interface/api-key.service.interface.js';

export class ApiKeyService implements IApiKeyService {
  constructor(
    private readonly apiKeyRepository: IApiKeyRepository,
    private readonly applicationRepository: IApplicationRepository,
  ) {}

  async list(applicationId: string): Promise<ApiKeyListResult> {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application.ok) {
      return err(application.error);
    }

    if (!application.value) {
      return err(new ApplicationNotFoundError());
    }

    const found = await this.apiKeyRepository.findByApplicationId(applicationId);

    if (!found.ok) {
      return err(found.error);
    }

    return ok(found.value.map(toApiKeyResponse));
  }

  async create(applicationId: string, dto: CreateApiKeyDto): Promise<ApiKeyCreatedResult> {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application.ok) {
      return err(application.error);
    }

    if (!application.value) {
      return err(new ApplicationNotFoundError());
    }

    const { rawKey, keyPrefix } = generateApiKey();

    const expiresAt = dto.expiresInDays
      ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const created = await this.apiKeyRepository.create({
      applicationId,
      name: dto.name,
      keyPrefix,
      hashedKey: hashToken(rawKey),
      expiresAt,
    });

    if (!created.ok) {
      return err(created.error);
    }

    return ok(new ApiKeyCreatedResponse(toApiKeyResponse(created.value), rawKey));
  }

  async revoke(applicationId: string, apiKeyId: string): Promise<RevokeApiKeyResult> {
    const found = await this.apiKeyRepository.findById(apiKeyId);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value || found.value.applicationId.toString() !== applicationId) {
      return err(new ApiKeyNotFoundError());
    }

    const revoked = await this.apiKeyRepository.revoke(apiKeyId);

    if (!revoked.ok) {
      return err(revoked.error);
    }

    return ok({ message: 'API key revoked successfully.' });
  }

  async verifyApiKey(rawKey: string): Promise<VerifyApiKeyResult> {
    const found = await this.apiKeyRepository.findByHashedKey(hashToken(rawKey));

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value || found.value.status !== 'active') {
      return err(new InvalidApiKeyError());
    }

    if (found.value.expiresAt && found.value.expiresAt.getTime() < Date.now()) {
      return err(new InvalidApiKeyError());
    }

    const application = await this.applicationRepository.findById(
      found.value.applicationId.toString(),
    );

    if (!application.ok) {
      return err(application.error);
    }

    if (!application.value || !application.value.isActive) {
      return err(new InvalidApiKeyError());
    }

    // Best-effort, don't block the request on this write.
    void this.apiKeyRepository.touchLastUsed(found.value._id.toString());

    return ok(application.value);
  }
}
