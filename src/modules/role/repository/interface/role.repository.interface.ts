import type { ClientSession } from 'mongoose';
import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';
import type { CreateRoleDto } from '../../dto/create-role.dto.js';
import type { UpdateRoleDto } from '../../dto/update-role.dto.js';
import type { IRole } from '../../model/role.model.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IRoleRepository {
  /** Returns all roles with `permissions` populated to IPermission docs. */
  findAll(tenantId: string | undefined): Promise<DataResult<IRole[]>>;

  /** Returns a single role with `permissions` populated to IPermission docs. */
  findById(id: string): Promise<DataResult<IRole | null>>;

  findByName(name: string, tenantId: string | undefined): Promise<DataResult<IRole | null>>;

  /** Returns roles with `permissions` populated, for permission evaluation. */
  findByIdsWithPermissions(ids: string[]): Promise<DataResult<IRole[]>>;

  create(
    dto: CreateRoleDto & { tenantId?: string },
    session?: ClientSession,
  ): Promise<DataResult<IRole>>;

  updateMeta(id: string, dto: UpdateRoleDto): Promise<DataResult<IRole | null>>;

  setPermissions(id: string, permissionIds: string[]): Promise<DataResult<IRole | null>>;

  delete(id: string): Promise<DataResult<boolean>>;
}
