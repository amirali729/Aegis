import type { CreatePermissionDto } from '../../dto/create-permission.dto.js';
import type { UpdatePermissionDto } from '../../dto/update-permission.dto.js';
import type {
  DeletePermissionResult,
  PermissionListResult,
  PermissionResult,
} from '../../types/permission.types.js';

export interface IPermissionService {
  list(): Promise<PermissionListResult>;

  getById(id: string): Promise<PermissionResult>;

  create(dto: CreatePermissionDto): Promise<PermissionResult>;

  update(id: string, dto: UpdatePermissionDto): Promise<PermissionResult>;

  delete(id: string): Promise<DeletePermissionResult>;
}
