import { User } from '../../../modules/auth/model/user.model.js';
import type { IPermission } from '../../../modules/permission/model/permission.model.js';
import type { IRole } from '../../../modules/role/model/role.model.js';

/**
 * Loads the effective set of permission keys for a user by walking
 * User -> roles -> permissions and taking the union (see Authorization
 * Architecture doc, section 13: "the final permission set is the union
 * of all permissions").
 *
 * `organizationId`, when provided, scopes this to roles that actually
 * belong to that organization (role.tenantId === organizationId) plus
 * any GLOBAL roles the user holds (role.tenantId undefined - a
 * platform-level Admin, not scoped to any single org). Without this
 * scoping, a permission granted via a role in one small org the caller
 * legitimately owns would count as held everywhere, for every org - a
 * real privilege-escalation path once resolveTenant lets a client
 * declare which org it's acting as via a header. See
 * resolveTenant.middleware.ts for the matching fix (verifying the
 * caller actually belongs to that org before trusting the header at
 * all).
 *
 * This queries fresh on every call rather than trusting a JWT claim, so
 * role/permission changes take effect immediately. A future iteration
 * can add a Redis-backed cache here (see docs, section 18) without
 * changing the requirePermission middleware's contract.
 */
export async function getUserPermissionKeys(
  userId: string,
  organizationId?: string,
): Promise<Set<string>> {
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
    const roleTenantId = role.tenantId?.toString();

    // A role scoped to a DIFFERENT org than the one this request is
    // acting as doesn't count - only global (platform) roles or roles
    // scoped to the current org contribute permissions here.
    const roleApplies = roleTenantId === undefined || roleTenantId === organizationId;

    if (!roleApplies) continue;

    for (const permission of role.permissions) {
      const populated = permission as unknown as IPermission;
      if (populated?.key) {
        keys.add(populated.key);
      }
    }
  }

  return keys;
}
