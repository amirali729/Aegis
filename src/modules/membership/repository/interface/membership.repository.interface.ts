import type { ClientSession } from 'mongoose';
import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';
import type { IMembership, MembershipStatus } from '../../model/membership.model.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IMembershipRepository {
  /** Returns memberships with `userId` populated to IUser docs. */
  findByOrganization(organizationId: string): Promise<DataResult<IMembership[]>>;

  findOne(organizationId: string, userId: string): Promise<DataResult<IMembership | null>>;

  create(
    organizationId: string,
    userId: string,
    status?: MembershipStatus,
    session?: ClientSession,
  ): Promise<DataResult<IMembership>>;

  updateStatus(
    organizationId: string,
    userId: string,
    status: MembershipStatus,
  ): Promise<DataResult<IMembership | null>>;

  delete(organizationId: string, userId: string): Promise<DataResult<boolean>>;

  /**
   * Grants an organization-scoped Role to this membership. Idempotent -
   * adding a role the membership already holds is a no-op ($addToSet).
   * Returns null if no membership exists for (organizationId, userId).
   */
  addRole(
    organizationId: string,
    userId: string,
    roleId: string,
    session?: ClientSession,
  ): Promise<DataResult<IMembership | null>>;

  /**
   * Revokes an organization-scoped Role from this membership. Returns
   * null if no membership exists for (organizationId, userId).
   */
  removeRole(
    organizationId: string,
    userId: string,
    roleId: string,
  ): Promise<DataResult<IMembership | null>>;
}
