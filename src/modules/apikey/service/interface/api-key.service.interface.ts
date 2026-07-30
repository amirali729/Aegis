import type { CreateApiKeyDto } from '../../dto/create-api-key.dto.js';
import type {
  ApiKeyCreatedResult,
  ApiKeyListResult,
  RevokeApiKeyResult,
  VerifyApiKeyResult,
} from '../../types/api-key.types.js';

export interface IApiKeyService {
  list(applicationId: string, tenantId: string | undefined): Promise<ApiKeyListResult>;

  create(
    applicationId: string,
    dto: CreateApiKeyDto,
    tenantId: string | undefined,
    actorId?: string,
  ): Promise<ApiKeyCreatedResult>;

  revoke(
    applicationId: string,
    apiKeyId: string,
    tenantId: string | undefined,
    actorId?: string,
  ): Promise<RevokeApiKeyResult>;

  /**
   * Verifies a raw API key presented in a request header, returning the
   * owning Application if valid, active, and unexpired. Also updates
   * lastUsedAt as a side effect (best-effort, never blocks the request).
   */
  verifyApiKey(rawKey: string): Promise<VerifyApiKeyResult>;
}
