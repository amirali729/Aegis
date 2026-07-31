import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';
import type { CreatePermissionDto } from '../../dto/create-permission.dto.js';
import type { UpdatePermissionDto } from '../../dto/update-permission.dto.js';
import type { IPermission } from '../../model/permission.model.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IPermissionRepository {
  findAll(tenantId: string | undefined): Promise<DataResult<IPermission[]>>;

  findById(id: string): Promise<DataResult<IPermission | null>>;

  findByKey(key: string, tenantId: string | undefined): Promise<DataResult<IPermission | null>>;

  findByIds(ids: string[]): Promise<DataResult<IPermission[]>>;

  create(dto: CreatePermissionDto): Promise<DataResult<IPermission>>;

  update(id: string, dto: UpdatePermissionDto): Promise<DataResult<IPermission | null>>;

  delete(id: string): Promise<DataResult<boolean>>;
}
