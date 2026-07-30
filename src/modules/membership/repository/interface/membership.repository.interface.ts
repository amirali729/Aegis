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
  ): Promise<DataResult<IMembership>>;

  updateStatus(
    organizationId: string,
    userId: string,
    status: MembershipStatus,
  ): Promise<DataResult<IMembership | null>>;

  delete(organizationId: string, userId: string): Promise<DataResult<boolean>>;
}
