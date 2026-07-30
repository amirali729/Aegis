import { err, ok } from '../../../shared/result/result.js';
import { UserNotFoundError } from '../../auth/errors/user-not-found.error.js';
import { PermissionNotFoundError } from '../../permission/errors/permission-not-found.error.js';
import type { IPermissionRepository } from '../../permission/repository/interface/permission.repository.interface.js';
import type { AssignRoleDto } from '../dto/assign-role.dto.js';
import { CreateRoleDto } from '../dto/create-role.dto.js';
import type { SetRolePermissionsDto } from '../dto/set-role-permission.dto.js';
import type { UpdateRoleDto } from '../dto/update-role.dto.js';
import { RoleAlreadyExistsError } from '../errors/role-already-exists.error.js';
import { RoleNotFoundError } from '../errors/role-not-found.error.js';
import { SystemRoleImmutableError } from '../errors/system-role-immutable.error.js';
import type { IRoleRepository } from '../repository/interface/role.repository.interface.js';
import type { IUserRoleRepository } from '../repository/interface/user-role.repository.interface.js';
import { AssignRoleResponse } from '../responses/assign-role.response.js';
import type {
  AssignRoleResult,
  DeleteRoleResult,
  RoleError,
  RoleListResult,
  RoleResult,
} from '../types/role.types.js';
import type { IRoleService } from './interface/role.service.interface.js';
import { toRoleResponse } from './role-mapper.js';

import { RecordAuditEventDto } from '../../audit/dto/record-audit-event.dto.js';
import type { IAuditLogger } from '../../audit/service/interface/audit-logger.interface.js';

export class RoleService implements IRoleService {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly auditLogger?: IAuditLogger,
  ) {}

  async list(tenantId: string | undefined): Promise<RoleListResult> {
    const found = await this.roleRepository.findAll(tenantId);

    if (!found.ok) {
      return err(found.error);
    }

    return ok(found.value.map(toRoleResponse));
  }

  async getById(id: string): Promise<RoleResult> {
    const found = await this.roleRepository.findById(id);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new RoleNotFoundError());
    }

    return ok(toRoleResponse(found.value));
  }

  async create(
    dto: CreateRoleDto,
    tenantId: string | undefined,
    actorId?: string,
  ): Promise<RoleResult> {
    const existing = await this.roleRepository.findByName(dto.name, tenantId);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (existing.value) {
      return err(new RoleAlreadyExistsError());
    }

    if (dto.permissionIds.length > 0) {
      const permissionCheck = await this.validatePermissionIds(dto.permissionIds);
      if (permissionCheck) {
        return err(permissionCheck);
      }
    }

    const created = await this.roleRepository.create(
      new CreateRoleDto(dto.name, dto.description, dto.permissionIds, tenantId),
    );

    if (!created.ok) {
      return err(created.error);
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'role.created',
        true,
        actorId,
        'user',
        'role',
        created.value._id.toString(),
        undefined,
        undefined,
        { name: created.value.name },
        tenantId,
      ),
    );

    return ok(toRoleResponse(created.value));
  }

  async updateMeta(id: string, dto: UpdateRoleDto, actorId?: string): Promise<RoleResult> {
    const existing = await this.roleRepository.findById(id);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (!existing.value) {
      return err(new RoleNotFoundError());
    }

    if (existing.value.isSystem && dto.name !== undefined) {
      return err(new SystemRoleImmutableError());
    }

    if (dto.name) {
      const nameTaken = await this.roleRepository.findByName(
        dto.name,
        existing.value.tenantId?.toString(),
      );
      if (!nameTaken.ok) {
        return err(nameTaken.error);
      }
      if (nameTaken.value && nameTaken.value._id.toString() !== id) {
        return err(new RoleAlreadyExistsError());
      }
    }

    const updated = await this.roleRepository.updateMeta(id, dto);

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new RoleNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto('role.updated', true, actorId, 'user', 'role', id),
    );

    return ok(toRoleResponse(updated.value));
  }

  async setPermissions(
    id: string,
    dto: SetRolePermissionsDto,
    actorId?: string,
  ): Promise<RoleResult> {
    const existing = await this.roleRepository.findById(id);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (!existing.value) {
      return err(new RoleNotFoundError());
    }

    if (dto.permissionIds.length > 0) {
      const permissionCheck = await this.validatePermissionIds(dto.permissionIds);
      if (permissionCheck) {
        return err(permissionCheck);
      }
    }

    const updated = await this.roleRepository.setPermissions(id, dto.permissionIds);

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new RoleNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'role.permissions_set',
        true,
        actorId,
        'user',
        'role',
        id,
        undefined,
        undefined,
        {
          permissionIds: dto.permissionIds,
        },
      ),
    );

    return ok(toRoleResponse(updated.value));
  }

  async delete(id: string, actorId?: string): Promise<DeleteRoleResult> {
    const existing = await this.roleRepository.findById(id);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (!existing.value) {
      return err(new RoleNotFoundError());
    }

    if (existing.value.isSystem) {
      return err(new SystemRoleImmutableError());
    }

    const deleted = await this.roleRepository.delete(id);

    if (!deleted.ok) {
      return err(deleted.error);
    }

    if (!deleted.value) {
      return err(new RoleNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto('role.deleted', true, actorId, 'user', 'role', id),
    );

    return ok({ message: 'Role deleted successfully.' });
  }

  async assignToUser(dto: AssignRoleDto, actorId?: string): Promise<AssignRoleResult> {
    const role = await this.roleRepository.findById(dto.roleId);

    if (!role.ok) {
      return err(role.error);
    }

    if (!role.value) {
      return err(new RoleNotFoundError());
    }

    const updated = await this.userRoleRepository.addRole(dto.userId, dto.roleId);

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new UserNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'role.assigned',
        true,
        actorId,
        'user',
        'user',
        dto.userId,
        undefined,
        undefined,
        { roleId: dto.roleId },
      ),
    );

    return ok(new AssignRoleResponse(dto.userId, updated.value));
  }

  async removeFromUser(dto: AssignRoleDto, actorId?: string): Promise<AssignRoleResult> {
    const updated = await this.userRoleRepository.removeRole(dto.userId, dto.roleId);

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new UserNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'role.removed',
        true,
        actorId,
        'user',
        'user',
        dto.userId,
        undefined,
        undefined,
        { roleId: dto.roleId },
      ),
    );

    return ok(new AssignRoleResponse(dto.userId, updated.value, 'Role removed successfully.'));
  }

  private async validatePermissionIds(permissionIds: string[]): Promise<RoleError | undefined> {
    const found = await this.permissionRepository.findByIds(permissionIds);

    if (!found.ok) {
      return found.error;
    }

    if (found.value.length !== permissionIds.length) {
      return new PermissionNotFoundError('One or more permission IDs do not exist.');
    }

    return undefined;
  }
}
