import { err, ok } from '../../../shared/result/result.js';
import { CreatePermissionDto } from '../dto/create-permission.dto.js';
import type { UpdatePermissionDto } from '../dto/update-permission.dto.js';
import { InvalidPermissionKeyError } from '../errors/invalid-permission-key.error.js';
import { PermissionAlreadyExistsError } from '../errors/permission-already-exists.error.js';
import { PermissionNotFoundError } from '../errors/permission-not-found.error.js';
import type { IPermissionRepository } from '../repository/interface/permission.repository.interface.js';
import type {
  DeletePermissionResult,
  PermissionListResult,
  PermissionResult,
} from '../types/permission.types.js';
import type { IPermissionService } from './interface/permission.service.interface.js';
import { toPermissionResponse } from './permission.mapper.js';

import { RecordAuditEventDto } from '../../audit/dto/record-audit-event.dto.js';
import type { IAuditLogger } from '../../audit/service/interface/audit-logger.interface.js';

const PERMISSION_KEY_PATTERN = /^[a-z0-9_]+:[a-z0-9_]+$/;

export class PermissionService implements IPermissionService {
  constructor(
    private readonly repository: IPermissionRepository,
    private readonly auditLogger?: IAuditLogger,
  ) {}

  async list(tenantId: string | undefined): Promise<PermissionListResult> {
    const found = await this.repository.findAll(tenantId);

    if (!found.ok) {
      return err(found.error);
    }

    return ok(found.value.map(toPermissionResponse));
  }

  async getById(id: string): Promise<PermissionResult> {
    const found = await this.repository.findById(id);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new PermissionNotFoundError());
    }

    return ok(toPermissionResponse(found.value));
  }

  async create(
    dto: CreatePermissionDto,
    tenantId: string | undefined,
    actorId?: string,
  ): Promise<PermissionResult> {
    const key = dto.key.trim().toLowerCase();

    if (!PERMISSION_KEY_PATTERN.test(key)) {
      return err(new InvalidPermissionKeyError());
    }

    const existing = await this.repository.findByKey(key, tenantId);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (existing.value) {
      return err(new PermissionAlreadyExistsError());
    }

    const created = await this.repository.create(
      new CreatePermissionDto(key, dto.description, tenantId),
    );

    if (!created.ok) {
      return err(created.error);
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto(
        'permission.created',
        true,
        actorId,
        'user',
        'permission',
        created.value._id.toString(),
        undefined,
        undefined,
        { key: created.value.key },
        tenantId,
      ),
    );

    return ok(toPermissionResponse(created.value));
  }

  async update(id: string, dto: UpdatePermissionDto, actorId?: string): Promise<PermissionResult> {
    const updated = await this.repository.update(id, dto);

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new PermissionNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto('permission.updated', true, actorId, 'user', 'permission', id),
    );

    return ok(toPermissionResponse(updated.value));
  }

  async delete(id: string, actorId?: string): Promise<DeletePermissionResult> {
    const deleted = await this.repository.delete(id);

    if (!deleted.ok) {
      return err(deleted.error);
    }

    if (!deleted.value) {
      return err(new PermissionNotFoundError());
    }

    void this.auditLogger?.record(
      new RecordAuditEventDto('permission.deleted', true, actorId, 'user', 'permission', id),
    );

    return ok({ message: 'Permission deleted successfully.' });
  }
}
