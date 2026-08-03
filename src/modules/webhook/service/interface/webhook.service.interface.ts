import type { CreateWebhookDto } from '../../dto/create-webhook.dto.js';
import type { UpdateWebhookDto } from '../../dto/update-webhook.dto.js';
import type {
  DeleteWebhookResult,
  RotateWebhookSecretResult,
  WebhookCreatedResult,
  WebhookListResult,
  WebhookResult,
} from '../../types/webhook.types.js';

export interface IWebhookService {
  list(organizationId: string, callerTenantId: string | undefined): Promise<WebhookListResult>;

  create(
    organizationId: string,
    dto: CreateWebhookDto,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<WebhookCreatedResult>;

  update(
    organizationId: string,
    webhookId: string,
    dto: UpdateWebhookDto,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<WebhookResult>;

  rotateSecret(
    organizationId: string,
    webhookId: string,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<RotateWebhookSecretResult>;

  enable(
    organizationId: string,
    webhookId: string,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<WebhookResult>;

  disable(
    organizationId: string,
    webhookId: string,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<WebhookResult>;

  delete(
    organizationId: string,
    webhookId: string,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<DeleteWebhookResult>;
}
