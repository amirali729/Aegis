import { ValidationError } from '../../../shared/errors/validation.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { CreateOrganizationDto } from '../dto/create-organization.dto.js';
import type { UpdateOrganizationDto } from '../dto/update-organization.dto.js';
import { OrganizationNotFoundError } from '../errors/organization-not-found.error.js';
import { OrganizationSlugTakenError } from '../errors/organization-slug-taken.error.js';
import type { IOrganizationRepository } from '../repository/interface/organization.repository.interface.js';
import type {
  DeleteOrganizationResult,
  OrganizationListResult,
  OrganizationResult,
} from '../types/organization.types.js';
import type { IOrganizationService } from './interface/organization.service.interface.js';
import { toOrganizationResponse } from './organization-mapper.js';

import type { IAuthRepository } from '../../auth/repository/interface/auth.repository.interface.js';
import type { IMembershipRepository } from '../../membership/repository/interface/membership.repository.interface.js';
import type { IPermissionRepository } from '../../permission/repository/interface/permission.repository.interface.js';
import { CreateRoleDto } from '../../role/dto/create-role.dto.js';
import type { IRoleRepository } from '../../role/repository/interface/role.repository.interface.js';

import { RecordAuditEventDto } from '../../audit/dto/record-audit-event.dto.js';
import type { IAuditLogger } from '../../audit/service/interface/audit-logger.interface.js';

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
    private readonly authRepository: IAuthRepository,
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

    const created = await this.repository.create({
      ...dto,
      slug: baseSlug,
    });

    if (!created.ok) {
      return err(created.error);
    }

    const organizationId = created.value._id.toString();

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
        { slug: created.value.slug },
        organizationId,
      ),
    );

    // Whoever creates an org becomes its owner - without this, a brand
    // new org would have no members at all and nobody could ever manage
    // it (the org-creation permission deadlock this whole fix addresses).
    if (actorId) {
      await this.provisionOwner(organizationId, actorId);
    }

    return ok(toOrganizationResponse(created.value));
  }

  /**
   * Auto-provisions the creator as the new Organization's owner: an
   * org-scoped "Owner" role holding every platform permission key
   * (referencing the existing GLOBAL Permission catalog - no need to
   * duplicate Permission documents per org, only the Role granting them
   * is org-scoped), an active Membership, and the role attached to the
   * user's account. Best-effort: failures here are logged but don't
   * fail organization creation itself, since the org was already
   * created successfully - an operator can always fix membership by
   * hand afterward, whereas rolling back the org would be worse.
   */
  private async provisionOwner(organizationId: string, userId: string): Promise<void> {
    try {
      const membershipResult = await this.membershipRepository.create(
        organizationId,
        userId,
        'active',
      );
      if (!membershipResult.ok) {
        console.error('provisionOwner: failed to create membership', membershipResult.error);
      }

      // An org-scoped role only ever applies when MULTI_TENANT=true -
      // resolveTenant.middleware.ts leaves req.tenantId permanently
      // undefined otherwise, and permission-evaluator.ts only counts a
      // role toward a request when role.tenantId matches req.tenantId
      // (or the role is global). Creating one anyway in single-tenant
      // mode would be dead weight that can never actually grant
      // anything - membership above is still recorded either way.
      if (process.env.MULTI_TENANT !== 'true') {
        return;
      }

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
      );

      if (!role.ok) {
        console.error('provisionOwner: failed to create Owner role', role.error);
        return;
      }

      const userResult = await this.authRepository.findById(userId);
      if (!userResult.ok || !userResult.value) {
        console.error('provisionOwner: failed to load creating user');
        return;
      }

      userResult.value.roles.push(role.value._id);
      await this.authRepository.save(userResult.value, { validateBeforeSave: false });
    } catch (error) {
      console.error('provisionOwner: unexpected error', error);
    }
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

    return ok({ message: 'Organization deleted successfully.' });
  }
}
