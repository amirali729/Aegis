import type { IRole } from '../model/role.model.js';
import type { IPermission } from '../../permission/model/permission.model.js';
import { RoleResponse } from '../responses/role.response.js';

export function toRoleResponse(role: IRole): RoleResponse {
  const permissionKeys = role.permissions.map((permission) => {
    // `permissions` is populated by the repository, so at runtime these
    // are IPermission docs even though the static type is ObjectId[].
    const populated = permission as unknown as IPermission;
    return populated.key ?? permission.toString();
  });

  return new RoleResponse(
    role._id.toString(),
    role.name,
    role.description,
    role.isSystem,
    permissionKeys,
    role.createdAt,
  );
}
