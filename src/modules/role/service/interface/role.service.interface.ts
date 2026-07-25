import type { CreateRoleDto } from '../../dto/create-role.dto.js';
import type { UpdateRoleDto } from '../../dto/update-role.dto.js';
import type { SetRolePermissionsDto } from '../../dto/set-role-permissions.dto.js';
import type { AssignRoleDto } from '../../dto/assign-role.dto.js';
import type {
  AssignRoleResult,
  DeleteRoleResult,
  RoleListResult,
  RoleResult,
} from '../../types/role.types.js';

export interface IRoleService {
  list(): Promise<RoleListResult>;

  getById(id: string): Promise<RoleResult>;

  create(dto: CreateRoleDto): Promise<RoleResult>;

  updateMeta(id: string, dto: UpdateRoleDto): Promise<RoleResult>;

  setPermissions(id: string, dto: SetRolePermissionsDto): Promise<RoleResult>;

  delete(id: string): Promise<DeleteRoleResult>;

  assignToUser(dto: AssignRoleDto): Promise<AssignRoleResult>;

  removeFromUser(dto: AssignRoleDto): Promise<AssignRoleResult>;
}
