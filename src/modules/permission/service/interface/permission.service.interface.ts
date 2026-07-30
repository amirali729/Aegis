import type { CreatePermissionDto } from '../../dto/create-permission.dto.js';
import type { UpdatePermissionDto } from '../../dto/update-permission.dto.js';
import type {
  DeletePermissionResult,
  PermissionListResult,
  PermissionResult,
} from '../../types/permission.types.js';

export interface IPermissionService {
  list(tenantId: string | undefined): Promise<PermissionListResult>;

  getById(id: string): Promise<PermissionResult>;

  create(
    dto: CreatePermissionDto,
    tenantId: string | undefined,
    actorId?: string,
  ): Promise<PermissionResult>;

  update(id: string, dto: UpdatePermissionDto, actorId?: string): Promise<PermissionResult>;

  delete(id: string, actorId?: string): Promise<DeletePermissionResult>;
}
