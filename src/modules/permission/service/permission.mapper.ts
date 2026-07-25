import type { IPermission } from '../model/permission.model.js';
import { PermissionResponse } from '../responses/permission.response.js';

export function toPermissionResponse(permission: IPermission): PermissionResponse {
  return new PermissionResponse(
    permission._id.toString(),
    permission.key,
    permission.description,
    permission.createdAt,
  );
}
