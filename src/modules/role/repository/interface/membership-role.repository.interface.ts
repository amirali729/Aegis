import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';

export type DataResult<T> = Result<T, InfrastructureError>;

/**
 * Replaces the old IUserRoleRepository (which read/wrote User.roles).
 * Organization-scoped role assignment now happens on Membership -
 * Roles never attach directly to a User (see docs, section 9:
 * Membership Architecture). All methods are scoped to a specific
 * (organizationId, userId) membership.
 */
export interface IMembershipRoleRepository {
  findRoleIds(organizationId: string, userId: string): Promise<DataResult<string[] | null>>;

  addRole(
    organizationId: string,
    userId: string,
    roleId: string,
  ): Promise<DataResult<string[] | null>>;

  removeRole(
    organizationId: string,
    userId: string,
    roleId: string,
  ): Promise<DataResult<string[] | null>>;
}
