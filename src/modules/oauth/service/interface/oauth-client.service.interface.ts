import type { CreateOAuthClientDto } from '../../dto/create-oauth-client.dto.js';
import type {
  OAuthClientCreatedResult,
  OAuthClientListResult,
  RegenerateClientSecretResult,
  RevokeOAuthClientResult,
} from '../../types/oauth-client.types.js';

export interface IOAuthClientService {
  list(applicationId: string, tenantId: string | undefined): Promise<OAuthClientListResult>;

  create(
    applicationId: string,
    dto: CreateOAuthClientDto,
    tenantId: string | undefined,
    actorId?: string,
  ): Promise<OAuthClientCreatedResult>;

  regenerateSecret(
    applicationId: string,
    clientId: string,
    tenantId: string | undefined,
    actorId?: string,
  ): Promise<RegenerateClientSecretResult>;

  revoke(
    applicationId: string,
    clientId: string,
    tenantId: string | undefined,
    actorId?: string,
  ): Promise<RevokeOAuthClientResult>;
}
