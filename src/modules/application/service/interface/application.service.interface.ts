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

  getById(id: string): Promise<ApplicationResult>;

  create(
    dto: CreateApplicationDto,
    tenantId: string | undefined,
  ): Promise<ApplicationCreatedResult>;

  update(id: string, dto: UpdateApplicationDto): Promise<ApplicationResult>;

  delete(id: string): Promise<DeleteApplicationResult>;

  regenerateSecret(id: string): Promise<RegenerateSecretResult>;

  verifyClientCredentials(clientId: string, clientSecret: string): Promise<VerifyApiKeyResult>;
}
