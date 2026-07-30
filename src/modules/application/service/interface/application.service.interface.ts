import type { CreateApplicationDto } from '../../dto/create-application.dto.js';
import type { UpdateApplicationDto } from '../../dto/update-application.dto.js';
import type {
  ApplicationCreatedResult,
  ApplicationListResult,
  ApplicationResult,
  DeleteApplicationResult,
  RegenerateSecretResult,
  VerifyApiKeyResult,
} from '../../types/application.types.js';

export interface IApplicationService {
  list(tenantId: string | undefined): Promise<ApplicationListResult>;

  getById(id: string, tenantId: string | undefined): Promise<ApplicationResult>;

  create(
    dto: CreateApplicationDto,
    tenantId: string | undefined,
    actorId?: string,
  ): Promise<ApplicationCreatedResult>;

  update(
    id: string,
    dto: UpdateApplicationDto,
    tenantId: string | undefined,
  ): Promise<ApplicationResult>;

  delete(id: string, tenantId: string | undefined): Promise<DeleteApplicationResult>;

  regenerateSecret(id: string, tenantId: string | undefined): Promise<RegenerateSecretResult>;

  verifyClientCredentials(clientId: string, clientSecret: string): Promise<VerifyApiKeyResult>;
}
