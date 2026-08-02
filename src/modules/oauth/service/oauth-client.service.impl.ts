import { ValidationError } from '../../../shared/errors/validation.error.js';
import { createDomainEvent } from '../../../shared/events/domain-event.js';
import { DOMAIN_EVENTS } from '../../../shared/events/domain-events.js';
import { eventBus } from '../../../shared/events/event-bus.js';
import { err, ok } from '../../../shared/result/result.js';
import { hashSecretSlow } from '../../../shared/security/hashing/slow-hash.js';
import { ApplicationNotFoundError } from '../../application/errors/application-not-found.error.js';
import type { IApplicationRepository } from '../../application/repository/interface/application.repository.interface.js';
import {
  generateClientId,
  generateClientSecret,
} from '../../application/service/credential-generator.js';
import { RecordAuditEventDto } from '../../audit/dto/record-audit-event.dto.js';
import type { IAuditLogger } from '../../audit/service/interface/audit-logger.interface.js';
import type { CreateOAuthClientDto } from '../dto/create-oauth-client.dto.js';
import { OAuthClientNotFoundError } from '../errors/oauth-client-not-found.error.js';
import type { IOAuthClientRepository } from '../repository/interface/oauth-client.repository.interface.js';
import { OAuthClientCreatedResponse } from '../responses/oauth-client-created.response.js';
import { RegenerateClientSecretResponse } from '../responses/regenerate-client-secret.response.js';
import type {
  OAuthClientCreatedResult,
  OAuthClientListResult,
  RegenerateClientSecretResult,
  RevokeOAuthClientResult,
} from '../types/oauth-client.types.js';
import type { IOAuthClientService } from './interface/oauth-client.service.interface.js';
import { toOAuthClientResponse } from './oauth-client.mapper.js';

export class OAuthClientService implements IOAuthClientService {
  constructor(
    private readonly repository: IOAuthClientRepository,
    private readonly applicationRepository: IApplicationRepository,
    private readonly auditLogger?: IAuditLogger,
  ) {}

  async list(applicationId: string, tenantId: string | undefined): Promise<OAuthClientListResult> {
    const owned = await this.assertOwnedByCaller(applicationId, tenantId);
    if (owned) return err(owned);

    const found = await this.repository.findByApplicationId(applicationId);

    if (!found.ok) {
      return err(found.error);
    }

    return ok(found.value.map(toOAuthClientResponse));
  }

  async create(
    applicationId: string,
    dto: CreateOAuthClientDto,
    tenantId: string | undefined,
    actorId?: string,
  ): Promise<OAuthClientCreatedResult> {
    const owned = await this.assertOwnedByCaller(applicationId, tenantId);
    if (owned) return err(owned);

    if (dto.redirectUris.length === 0) {
      return err(new ValidationError('At least one redirect URI is required.'));
    }

    // Public clients (SPAs, mobile apps, anything that can't keep a
    // secret confidential) never receive a client secret - they rely on
    // PKCE instead. Confidential clients get a secret, hashed the same
    // way Application already hashes its own client secret, for
    // consistency with the existing convention in this codebase.
    const clientSecret = dto.clientType === 'confidential' ? generateClientSecret() : undefined;

    const created = await this.repository.create({
      applicationId,
      name: dto.name,
      clientId: generateClientId(),
      clientSecretHash: clientSecret ? await hashSecretSlow(clientSecret) : undefined,
      clientType: dto.clientType,
      redirectUris: dto.redirectUris,
      grantTypes: dto.grantTypes,
      scopes: dto.scopes,
    });

    if (!created.ok) {
      return err(created.error);
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'oauth_client.created',
        true,
        actorId,
        'user',
        'oauth_client',
        created.value._id.toString(),
        undefined,
        undefined,
        { applicationId, clientType: dto.clientType },
      ),
    );

    eventBus.publish(
      createDomainEvent(
        DOMAIN_EVENTS.OAUTH_CLIENT_CREATED,
        { oauthClientId: created.value._id.toString(), applicationId, clientType: dto.clientType },
        { organizationId: tenantId, actorId },
      ),
    );

    return ok(new OAuthClientCreatedResponse(toOAuthClientResponse(created.value), clientSecret));
  }

  async regenerateSecret(
    applicationId: string,
    clientId: string,
    tenantId: string | undefined,
    actorId?: string,
  ): Promise<RegenerateClientSecretResult> {
    const owned = await this.assertOwnedByCaller(applicationId, tenantId);
    if (owned) return err(owned);

    const existing = await this.findScopedClient(applicationId, clientId);
    if (!existing.ok) return err(existing.error);
    if (!existing.value) return err(new OAuthClientNotFoundError());

    if (existing.value.clientType === 'public') {
      return err(new ValidationError('Public clients do not have a client secret to regenerate.'));
    }

    const clientSecret = generateClientSecret();

    const updated = await this.repository.updateSecretHash(
      clientId,
      await hashSecretSlow(clientSecret),
    );

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new OAuthClientNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'oauth_client.secret_regenerated',
        true,
        actorId,
        'user',
        'oauth_client',
        clientId,
        undefined,
        undefined,
        { applicationId },
      ),
    );

    return ok(new RegenerateClientSecretResponse(updated.value.clientId, clientSecret));
  }

  async revoke(
    applicationId: string,
    clientId: string,
    tenantId: string | undefined,
    actorId?: string,
  ): Promise<RevokeOAuthClientResult> {
    const owned = await this.assertOwnedByCaller(applicationId, tenantId);
    if (owned) return err(owned);

    const existing = await this.findScopedClient(applicationId, clientId);
    if (!existing.ok) return err(existing.error);
    if (!existing.value) return err(new OAuthClientNotFoundError());

    const revoked = await this.repository.revoke(clientId);

    if (!revoked.ok) {
      return err(revoked.error);
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'oauth_client.revoked',
        true,
        actorId,
        'user',
        'oauth_client',
        clientId,
        undefined,
        undefined,
        { applicationId },
      ),
    );

    eventBus.publish(
      createDomainEvent(
        DOMAIN_EVENTS.OAUTH_CLIENT_REVOKED,
        { oauthClientId: clientId, applicationId },
        { organizationId: tenantId, actorId },
      ),
    );

    return ok({ message: 'OAuth client revoked successfully.' });
  }

  /**
   * Fetch-then-compare ownership check (IDOR guard), the same pattern
   * used by ApiKeyService/ApplicationService: without it, anyone with
   * generic "oauth_client:*" permission could act on another tenant's
   * Application (and therefore its OAuth clients) by guessing/knowing an
   * applicationId. Returns an error to propagate, or undefined if the
   * caller is authorized to proceed.
   */
  private async assertOwnedByCaller(
    applicationId: string,
    tenantId: string | undefined,
  ): Promise<ApplicationNotFoundError | undefined> {
    const application = await this.applicationRepository.findById(applicationId);

    if (!application.ok) {
      return new ApplicationNotFoundError();
    }

    if (!application.value || application.value.tenantId?.toString() !== tenantId) {
      return new ApplicationNotFoundError();
    }

    return undefined;
  }

  private async findScopedClient(applicationId: string, clientId: string) {
    const found = await this.repository.findById(clientId);

    if (!found.ok) {
      return found;
    }

    if (!found.value || found.value.applicationId.toString() !== applicationId) {
      return ok(null);
    }

    return found;
  }
}
