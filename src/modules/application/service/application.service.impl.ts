import { err, ok } from '../../../shared/result/result.js';
import { hashToken } from '../../../shared/security/hashing/token-hash.js';
import type { CreateApplicationDto } from '../dto/create-application.dto.js';
import type { UpdateApplicationDto } from '../dto/update-application.dto.js';
import { ApplicationNotFoundError } from '../errors/application-not-found.error.js';
import { InvalidClientCredentialsError } from '../errors/invalid-client-credentials.error.js';
import type { IApplicationRepository } from '../repository/interface/application.repository.interface.js';
import type {
  ApplicationCreatedResult,
  ApplicationListResult,
  ApplicationResult,
  DeleteApplicationResult,
  RegenerateSecretResult,
  VerifyApiKeyResult,
} from '../types/application.types.js';
import type { IApplicationService } from './interface/application.service.interface.js';
import { generateClientId, generateClientSecret } from './credential-generator.js';
import { toApplicationResponse } from './application-mapper.js';
import { ApplicationCreatedResponse } from '../responses/application-created.response.js';
import { RegenerateSecretResponse } from '../responses/regenerate-secret.response.js';

export class ApplicationService implements IApplicationService {
  constructor(private readonly repository: IApplicationRepository) {}

  async list(tenantId: string | undefined): Promise<ApplicationListResult> {
    const found = await this.repository.findAll(tenantId);

    if (!found.ok) {
      return err(found.error);
    }

    return ok(found.value.map(toApplicationResponse));
  }

  async getById(id: string): Promise<ApplicationResult> {
    const found = await this.repository.findById(id);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new ApplicationNotFoundError());
    }

    return ok(toApplicationResponse(found.value));
  }

  async create(
    dto: CreateApplicationDto,
    tenantId: string | undefined,
  ): Promise<ApplicationCreatedResult> {
    const clientId = generateClientId();
    const clientSecret = generateClientSecret();

    const created = await this.repository.create({
      ...dto,
      tenantId,
      clientId,
      clientSecretHash: hashToken(clientSecret),
    });

    if (!created.ok) {
      return err(created.error);
    }

    return ok(new ApplicationCreatedResponse(toApplicationResponse(created.value), clientSecret));
  }

  async update(id: string, dto: UpdateApplicationDto): Promise<ApplicationResult> {
    const updated = await this.repository.update(id, dto);

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new ApplicationNotFoundError());
    }

    return ok(toApplicationResponse(updated.value));
  }

  async delete(id: string): Promise<DeleteApplicationResult> {
    const deleted = await this.repository.delete(id);

    if (!deleted.ok) {
      return err(deleted.error);
    }

    if (!deleted.value) {
      return err(new ApplicationNotFoundError());
    }

    return ok({ message: 'Application deleted successfully.' });
  }

  async regenerateSecret(id: string): Promise<RegenerateSecretResult> {
    const existing = await this.repository.findById(id);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (!existing.value) {
      return err(new ApplicationNotFoundError());
    }

    const clientSecret = generateClientSecret();

    const updated = await this.repository.updateSecretHash(id, hashToken(clientSecret));

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new ApplicationNotFoundError());
    }

    return ok(new RegenerateSecretResponse(updated.value.clientId, clientSecret));
  }

  async verifyClientCredentials(
    clientId: string,
    clientSecret: string,
  ): Promise<VerifyApiKeyResult> {
    const found = await this.repository.findByClientId(clientId);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value || !found.value.isActive) {
      return err(new InvalidClientCredentialsError());
    }

    if (hashToken(clientSecret) !== found.value.clientSecretHash) {
      return err(new InvalidClientCredentialsError());
    }

    return ok(found.value);
  }
}
