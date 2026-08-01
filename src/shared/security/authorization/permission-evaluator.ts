import type { FilterQuery } from 'mongoose';
import { User } from '../../../modules/auth/model/user.model.js';
import type { IMembership } from '../../../modules/membership/model/membership.model.js';
import { Membership } from '../../../modules/membership/model/membership.model.js';
import type { IPermission } from '../../../modules/permission/model/permission.model.js';
import type { IRole } from '../../../modules/role/model/role.model.js';
import { ALL_PERMISSIONS, PLATFORM_ROLE_PERMISSIONS } from './platform-roles.js';

/**
 * Loads the effective set of permission keys for a user, unioning two
 * independent sources (see Authorization Architecture doc, section 5):
 *
 *  1. Platform-level permissions, from the user's fixed
 *     User.platformRole (see platform-roles.ts). Not scoped to any
 *     organization - a Platform Admin can view every organization.
 *
 *  2. Organization-level permissions, resolved by walking
 *     User -> Membership -> Role -> Permission for the organization
 *     this request is acting as (`organizationId`). Membership is the
 *     ONLY place org-level roles attach - there is no longer a
 *     User.roles field. A membership can hold multiple roles at once;
 *     the effective set is the union of all of them.
 *
 * When `organizationId` is omitted (single-tenant deployments, where
 * resolveTenant.middleware.ts never populates req.tenantId), org-level
 * permissions are resolved from ALL of the user's active memberships
 * instead of just one - in practice there is exactly one in a
 * single-tenant deployment, but this also means a user who happens to
 * belong to more than one org still gets a sane union rather than
 * silently seeing zero org permissions.
 *
 * This queries fresh on every call rather than trusting a JWT claim, so
 * role/permission changes take effect immediately. A future iteration
 * can add a Redis-backed cache here without changing the
 * requirePermission middleware's contract.
 */
export async function getUserPermissionKeys(
  userId: string,
  organizationId?: string,
): Promise<Set<string>> {
  const keys = new Set<string>();

  const user = await User.findById(userId).select('platformRole');
  if (!user) {
    return keys;
  }

  const platformPermissions = PLATFORM_ROLE_PERMISSIONS[user.platformRole];

  if (platformPermissions === ALL_PERMISSIONS) {
    // Platform Owner - grants everything, including permissions added
    // in the future. Callers (requirePermission/requireAnyPermission)
    // must check for this sentinel explicitly.
    keys.add(ALL_PERMISSIONS);
  } else {
    for (const key of platformPermissions) {
      keys.add(key);
    }
  }

  const membershipQuery: FilterQuery<IMembership> = { userId, status: 'active' };
  if (organizationId) {
    membershipQuery.organizationId = organizationId;
  }

  const memberships = await Membership.find(membershipQuery).populate<{
    roleIds: IRole[];
  }>({
    path: 'roleIds',
    populate: { path: 'permissions' },
  });

  for (const membership of memberships) {
    for (const role of membership.roleIds) {
      for (const permission of role.permissions) {
        const populated = permission as unknown as IPermission;
        if (populated?.key) {
          keys.add(populated.key);
        }
      }
    }
  }

  return keys;
}
