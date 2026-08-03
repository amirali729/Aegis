import crypto from 'crypto';

import { ValidationError } from '../../../shared/errors/validation.error.js';
import { err, ok } from '../../../shared/result/result.js';
import { encryptSecret } from '../../../shared/security/encryption/symmetric-encryption.js';
import { RecordAuditEventDto } from '../../audit/dto/record-audit-event.dto.js';
import type { IAuditLogger } from '../../audit/service/interface/audit-logger.interface.js';
import { OrganizationNotFoundError } from '../../organizations/errors/organization-not-found.error.js';
import type { CreateWebhookDto } from '../dto/create-webhook.dto.js';
import type { UpdateWebhookDto } from '../dto/update-webhook.dto.js';
import { WebhookNotFoundError } from '../errors/webhook-not-found.error.js';
import { toWebhookResponse } from '../mapper/webhook.mapper.js';
import type { IWebhookRepository } from '../repository/interface/webhook.repository.interface.js';
import { RotateWebhookSecretResponse } from '../responses/rotate-webhook-secret.response.js';
import { WebhookCreatedResponse } from '../responses/webhook-created.response.js';
import { validateWebhookUrl } from '../security/url-safety.js';
import type {
  DeleteWebhookResult,
  RotateWebhookSecretResult,
  WebhookCreatedResult,
  WebhookListResult,
  WebhookResult,
} from '../types/webhook.types.js';
import type { IWebhookService } from './interface/webhook.service.interface.js';

/** whsec_ prefix mirrors Stripe's convention - immediately recognizable as a webhook secret, distinct from an API key or client secret. */
function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('hex')}`;
}

export class WebhookService implements IWebhookService {
  constructor(
    private readonly repository: IWebhookRepository,
    private readonly auditLogger?: IAuditLogger,
  ) {}

  async list(
    organizationId: string,
    callerTenantId: string | undefined,
  ): Promise<WebhookListResult> {
    if (!this.belongsToCaller(organizationId, callerTenantId)) {
      return err(new OrganizationNotFoundError());
    }

    const found = await this.repository.findByOrganization(organizationId);

    if (!found.ok) {
      return err(found.error);
    }

    return ok(found.value.map(toWebhookResponse));
  }

  async create(
    organizationId: string,
    dto: CreateWebhookDto,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<WebhookCreatedResult> {
    if (!this.belongsToCaller(organizationId, callerTenantId)) {
      return err(new OrganizationNotFoundError());
    }

    const urlCheck = validateWebhookUrl(dto.url);
    if (!urlCheck.ok) {
      return err(new ValidationError(urlCheck.reason));
    }

    if (dto.subscribedEvents.length === 0) {
      return err(new ValidationError('At least one subscribed event (or "*") is required.'));
    }

    const secret = generateWebhookSecret();

    const created = await this.repository.create({
      organizationId,
      name: dto.name,
      url: dto.url,
      secretEncrypted: encryptSecret(secret),
      subscribedEvents: dto.subscribedEvents,
    });

    if (!created.ok) {
      return err(created.error);
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'webhook.created',
        true,
        actorId,
        'user',
        'webhook',
        created.value._id.toString(),
        undefined,
        undefined,
        { url: dto.url, subscribedEvents: dto.subscribedEvents },
        organizationId,
      ),
    );

    return ok(new WebhookCreatedResponse(toWebhookResponse(created.value), secret));
  }

  async update(
    organizationId: string,
    webhookId: string,
    dto: UpdateWebhookDto,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<WebhookResult> {
    if (!this.belongsToCaller(organizationId, callerTenantId)) {
      return err(new OrganizationNotFoundError());
    }

    const existing = await this.findScopedWebhook(organizationId, webhookId);
    if (!existing.ok) return err(existing.error);
    if (!existing.value) return err(new WebhookNotFoundError());

    if (dto.url !== undefined) {
      const urlCheck = validateWebhookUrl(dto.url);
      if (!urlCheck.ok) {
        return err(new ValidationError(urlCheck.reason));
      }
    }

    if (dto.subscribedEvents !== undefined && dto.subscribedEvents.length === 0) {
      return err(new ValidationError('At least one subscribed event (or "*") is required.'));
    }

    const updated = await this.repository.update(webhookId, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.url !== undefined ? { url: dto.url } : {}),
      ...(dto.subscribedEvents !== undefined ? { subscribedEvents: dto.subscribedEvents } : {}),
    });

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new WebhookNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'webhook.updated',
        true,
        actorId,
        'user',
        'webhook',
        webhookId,
        undefined,
        undefined,
        undefined,
        organizationId,
      ),
    );

    return ok(toWebhookResponse(updated.value));
  }

  async rotateSecret(
    organizationId: string,
    webhookId: string,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<RotateWebhookSecretResult> {
    if (!this.belongsToCaller(organizationId, callerTenantId)) {
      return err(new OrganizationNotFoundError());
    }

    const existing = await this.findScopedWebhook(organizationId, webhookId);
    if (!existing.ok) return err(existing.error);
    if (!existing.value) return err(new WebhookNotFoundError());

    const secret = generateWebhookSecret();

    const updated = await this.repository.updateSecret(webhookId, encryptSecret(secret));

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new WebhookNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'webhook.secret_rotated',
        true,
        actorId,
        'user',
        'webhook',
        webhookId,
        undefined,
        undefined,
        undefined,
        organizationId,
      ),
    );

    return ok(new RotateWebhookSecretResponse(webhookId, secret));
  }

  async enable(
    organizationId: string,
    webhookId: string,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<WebhookResult> {
    return this.setStatus(organizationId, webhookId, callerTenantId, 'active', actorId);
  }

  async disable(
    organizationId: string,
    webhookId: string,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<WebhookResult> {
    return this.setStatus(organizationId, webhookId, callerTenantId, 'disabled', actorId);
  }

  private async setStatus(
    organizationId: string,
    webhookId: string,
    callerTenantId: string | undefined,
    status: 'active' | 'disabled',
    actorId?: string,
  ): Promise<WebhookResult> {
    if (!this.belongsToCaller(organizationId, callerTenantId)) {
      return err(new OrganizationNotFoundError());
    }

    const existing = await this.findScopedWebhook(organizationId, webhookId);
    if (!existing.ok) return err(existing.error);
    if (!existing.value) return err(new WebhookNotFoundError());

    const updated = await this.repository.setStatus(webhookId, status);

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new WebhookNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        status === 'active' ? 'webhook.enabled' : 'webhook.disabled',
        true,
        actorId,
        'user',
        'webhook',
        webhookId,
        undefined,
        undefined,
        undefined,
        organizationId,
      ),
    );

    return ok(toWebhookResponse(updated.value));
  }

  async delete(
    organizationId: string,
    webhookId: string,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<DeleteWebhookResult> {
    if (!this.belongsToCaller(organizationId, callerTenantId)) {
      return err(new OrganizationNotFoundError());
    }

    const existing = await this.findScopedWebhook(organizationId, webhookId);
    if (!existing.ok) return err(existing.error);
    if (!existing.value) return err(new WebhookNotFoundError());

    const deleted = await this.repository.delete(webhookId);

    if (!deleted.ok) {
      return err(deleted.error);
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'webhook.deleted',
        true,
        actorId,
        'user',
        'webhook',
        webhookId,
        undefined,
        undefined,
        undefined,
        organizationId,
      ),
    );

    return ok({ message: 'Webhook deleted successfully.' });
  }

  /**
   * Fetch-then-compare ownership check (IDOR guard) - without it, any
   * caller holding generic "webhook:*" permission scoped to their OWN
   * organization could still reach or modify ANOTHER organization's
   * webhook simply by passing its id, since permission keys alone say
   * nothing about which specific resource a request targets. Every
   * organization-scoped resource in this codebase (Application,
   * Membership, Role assignment) uses this same pattern.
   */
  private async findScopedWebhook(organizationId: string, webhookId: string) {
    const found = await this.repository.findById(webhookId);

    if (!found.ok) {
      return found;
    }

    if (!found.value || found.value.organizationId.toString() !== organizationId) {
      return ok(null);
    }

    return found;
  }

  private belongsToCaller(organizationId: string, callerTenantId: string | undefined): boolean {
    return callerTenantId === undefined || callerTenantId === organizationId;
  }
}
