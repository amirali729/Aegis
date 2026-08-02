import mongoose from 'mongoose';

import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { ValidationError } from '../../../shared/errors/validation.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { CreateOrganizationDto } from '../dto/create-organization.dto.js';
import type { UpdateOrganizationDto } from '../dto/update-organization.dto.js';
import { OrganizationNotFoundError } from '../errors/organization-not-found.error.js';
import { OrganizationSlugTakenError } from '../errors/organization-slug-taken.error.js';
import type { IOrganization } from '../model/organization.model.js';
import type { IOrganizationRepository } from '../repository/interface/organization.repository.interface.js';
import type {
  DeleteOrganizationResult,
  OrganizationError,
  OrganizationListResult,
  OrganizationResult,
} from '../types/organization.types.js';
import type { IOrganizationService } from './interface/organization.service.interface.js';
import { toOrganizationResponse } from './organization-mapper.js';

import type { IMembershipRepository } from '../../membership/repository/interface/membership.repository.interface.js';
import type { IPermissionRepository } from '../../permission/repository/interface/permission.repository.interface.js';
import { CreateRoleDto } from '../../role/dto/create-role.dto.js';
import type { IRoleRepository } from '../../role/repository/interface/role.repository.interface.js';

import { createDomainEvent } from '../../../shared/events/domain-event.js';
import { DOMAIN_EVENTS } from '../../../shared/events/domain-events.js';
import { eventBus } from '../../../shared/events/event-bus.js';
import { RecordAuditEventDto } from '../../audit/dto/record-audit-event.dto.js';
import type { IAuditLogger } from '../../audit/service/interface/audit-logger.interface.js';

/**
 * The only things ever thrown out of the create() transaction below are
 * the domain errors already returned by the repository calls inside it
 * (all members of OrganizationError) or a bare InfrastructureError - this
 * type guard is how the catch block tells those apart from a genuine
 * unexpected exception (a real bug, a driver-level error, etc.) without
 * needing every repository error class to extend the built-in Error.
 */
function isOrganizationError(value: unknown): value is OrganizationError {
  return typeof value === 'object' && value !== null && 'kind' in value;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Name of the org-scoped role auto-provisioned for whoever creates an Organization. */
const OWNER_ROLE_NAME = 'Owner';

export class OrganizationService implements IOrganizationService {
  constructor(
    private readonly repository: IOrganizationRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly membershipRepository: IMembershipRepository,
    private readonly auditLogger?: IAuditLogger,
  ) {}

  private belongsToCaller(organizationId: string, callerTenantId: string | undefined): boolean {
    return callerTenantId === undefined || callerTenantId === organizationId;
  }

  async list(): Promise<OrganizationListResult> {
    const found = await this.repository.findAll();

    if (!found.ok) {
      return err(found.error);
    }

    return ok(found.value.map(toOrganizationResponse));
  }

  async getById(id: string, callerTenantId: string | undefined): Promise<OrganizationResult> {
    if (!this.belongsToCaller(id, callerTenantId)) {
      return err(new OrganizationNotFoundError());
    }

    const found = await this.repository.findById(id);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new OrganizationNotFoundError());
    }

    return ok(toOrganizationResponse(found.value));
  }

  async create(dto: CreateOrganizationDto, actorId?: string): Promise<OrganizationResult> {
    const baseSlug = slugify(dto.slug ?? dto.name);

    if (!baseSlug) {
      return err(new ValidationError('Could not derive a valid slug from the organization name.'));
    }

    const existing = await this.repository.findBySlug(baseSlug);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (existing.value) {
      return err(new OrganizationSlugTakenError());
    }

    // Everything below - creating the Organization, the creator's
    // Membership, the auto-provisioned "Owner" Role, and attaching that
    // Role to the Membership - now happens inside a single MongoDB
    // transaction (requires the replica-set MongoDB deployment - see
    // Docker/development/docker-compose.yml). Previously this was a
    // best-effort sequence of separate writes that could leave a
    // half-provisioned organization behind if any step failed partway
    // through (an org with no working Owner, or a Role that was never
    // attached to anyone) - see the Phase 1 architecture review, section
    // 18. Wrapping it in a transaction means either everything below
    // commits together, or none of it does - an organization is never
    // left in a broken, partially-provisioned state.
    const session = await mongoose.startSession();

    let organization: IOrganization | undefined;
    let provisionedRoleId: string | undefined;

    try {
      await session.withTransaction(async () => {
        const created = await this.repository.create({ ...dto, slug: baseSlug }, session);
        if (!created.ok) throw created.error;
        organization = created.value;

        if (!actorId) return;

        const organizationId = organization._id.toString();

        const membershipResult = await this.membershipRepository.create(
          organizationId,
          actorId,
          'active',
          session,
        );
        if (!membershipResult.ok) throw membershipResult.error;

        const globalPermissions = await this.permissionRepository.findAll(undefined);
        const permissionIds = globalPermissions.ok
          ? globalPermissions.value.map((p) => p._id.toString())
          : [];

        const role = await this.roleRepository.create(
          new CreateRoleDto(
            OWNER_ROLE_NAME,
            'Full access within this organization.',
            permissionIds,
            organizationId,
          ),
          session,
        );
        if (!role.ok) throw role.error;
        provisionedRoleId = role.value._id.toString();

        const attached = await this.membershipRepository.addRole(
          organizationId,
          actorId,
          provisionedRoleId,
          session,
        );
        if (!attached.ok) throw attached.error;
        if (!attached.value) throw new InfrastructureError();
      });
    } catch (error) {
      return err(isOrganizationError(error) ? error : new InfrastructureError());
    } finally {
      await session.endSession();
    }

    if (!organization) {
      // Should be unreachable - withTransaction() only resolves without
      // throwing once every write inside it (including this assignment)
      // has succeeded. Guarded anyway so TypeScript can narrow the type
      // below, and so a genuinely unexpected case fails loudly rather
      // than continuing with an undefined organization.
      return err(new InfrastructureError());
    }

    // Audit logging happens AFTER the transaction has committed, not
    // inside it - IAuditLogger isn't session-aware, and audit records are
    // deliberately fire-and-forget (never allowed to fail or block the
    // business operation they describe), so they don't belong inside the
    // atomic write set itself.
    const organizationId = organization._id.toString();

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'organization.created',
        true,
        actorId,
        'user',
        'organization',
        organizationId,
        undefined,
        undefined,
        { slug: organization.slug },
        organizationId,
      ),
    );

    eventBus.publish(
      createDomainEvent(
        DOMAIN_EVENTS.ORGANIZATION_CREATED,
        { organizationId, name: organization.name, slug: organization.slug },
        { organizationId, actorId },
      ),
    );

    // Previously, provisioning the Owner role called the Role
    // repository directly (bypassing RoleService.create()/
    // assignToUser(), which is where role.created/role.assigned audit
    // events are normally recorded) - meaning an org's very first role
    // grant was invisible to audit history. Recording both explicitly
    // here closes that gap.
    if (actorId && provisionedRoleId) {
      void this.auditLogger?.record(
        new RecordAuditEventDto(
          'role.created',
          true,
          actorId,
          'user',
          'role',
          provisionedRoleId,
          undefined,
          undefined,
          { name: OWNER_ROLE_NAME, organizationId },
          organizationId,
        ),
      );

      void this.auditLogger?.record(
        new RecordAuditEventDto(
          'role.assigned',
          true,
          actorId,
          'user',
          'user',
          actorId,
          undefined,
          undefined,
          { roleId: provisionedRoleId, organizationId },
          organizationId,
        ),
      );

      eventBus.publish(
        createDomainEvent(
          DOMAIN_EVENTS.ROLE_CREATED,
          { roleId: provisionedRoleId, name: OWNER_ROLE_NAME, organizationId },
          { organizationId, actorId },
        ),
      );

      eventBus.publish(
        createDomainEvent(
          DOMAIN_EVENTS.ROLE_ASSIGNED,
          { userId: actorId, roleId: provisionedRoleId, organizationId },
          { organizationId, actorId },
        ),
      );
    }

    return ok(toOrganizationResponse(organization));
  }

  async update(
    id: string,
    dto: UpdateOrganizationDto,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<OrganizationResult> {
    if (!this.belongsToCaller(id, callerTenantId)) {
      return err(new OrganizationNotFoundError());
    }

    const existing = await this.repository.findById(id);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (!existing.value) {
      return err(new OrganizationNotFoundError());
    }

    const updated = await this.repository.update(id, dto);

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new OrganizationNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'organization.updated',
        true,
        actorId,
        'user',
        'organization',
        id,
        undefined,
        undefined,
        undefined,
        id,
      ),
    );

    eventBus.publish(
      createDomainEvent(
        DOMAIN_EVENTS.ORGANIZATION_UPDATED,
        { organizationId: id },
        { organizationId: id, actorId },
      ),
    );

    return ok(toOrganizationResponse(updated.value));
  }

  async delete(
    id: string,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<DeleteOrganizationResult> {
    if (!this.belongsToCaller(id, callerTenantId)) {
      return err(new OrganizationNotFoundError());
    }

    const deleted = await this.repository.delete(id);

    if (!deleted.ok) {
      return err(deleted.error);
    }

    if (!deleted.value) {
      return err(new OrganizationNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'organization.deleted',
        true,
        actorId,
        'user',
        'organization',
        id,
        undefined,
        undefined,
        undefined,
        id,
      ),
    );

    eventBus.publish(
      createDomainEvent(
        DOMAIN_EVENTS.ORGANIZATION_DELETED,
        { organizationId: id },
        { organizationId: id, actorId },
      ),
    );

    return ok({ message: 'Organization deleted successfully.' });
  }
}
