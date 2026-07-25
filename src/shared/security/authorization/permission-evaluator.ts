import { User } from '../../../modules/auth/model/user.model.js';
import type { IPermission } from '../../../modules/permission/model/permission.model.js';
import type { IRole } from '../../../modules/role/model/role.model.js';

/**
 * Loads the effective set of permission keys for a user by walking
 * User -> roles -> permissions and taking the union (see Authorization
 * Architecture doc, section 13: "the final permission set is the union
 * of all permissions").
 *
 * This queries fresh on every call rather than trusting a JWT claim, so
 * role/permission changes take effect immediately. A future iteration
 * can add a Redis-backed cache here (see docs, section 18) without
 * changing the requirePermission middleware's contract.
 */
export async function getUserPermissionKeys(userId: string): Promise<Set<string>> {
  const user = await User.findById(userId)
    .select('roles')
    .populate<{ roles: IRole[] }>({
      path: 'roles',
      populate: { path: 'permissions' },
    });

  if (!user) {
    return new Set();
  }

  const keys = new Set<string>();

  for (const role of user.roles) {
    for (const permission of role.permissions) {
      const populated = permission as unknown as IPermission;
      if (populated?.key) {
        keys.add(populated.key);
      }
    }
  }

  return keys;
}
