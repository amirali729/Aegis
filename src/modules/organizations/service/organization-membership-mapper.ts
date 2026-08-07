import type { IRole } from '../../role/model/role.model.js';
import type { IMembership } from '../../membership/model/membership.model.js';
import type { IOrganization } from '../model/organization.model.js';
import { OrganizationMembershipResponse } from '../responses/organization-membership-response.js';

export function toOrganizationMembershipResponse(
  membership: IMembership,
): OrganizationMembershipResponse {
  // `organizationId` and `roleIds` are populated by
  // IMembershipRepository.findByUser(), so at runtime these are
  // IOrganization / IRole[] docs even though the static type is
  // ObjectId / ObjectId[] - same convention as
  // membership/service/membership-mapper.ts.
  const organization = membership.organizationId as unknown as IOrganization;
  const roles = membership.roleIds as unknown as IRole[];

  return new OrganizationMembershipResponse(
    organization._id.toString(),
    organization.name,
    organization.slug,
    organization.status,
    organization.plan,
    membership.status,
    roles.map((role) => ({ id: role._id.toString(), name: role.name })),
    membership.joinedAt,
  );
}
