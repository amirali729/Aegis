import type { IOrganization } from '../model/organization.model.js';
import { OrganizationResponse } from '../responses/organization-response.js';

export function toOrganizationResponse(organization: IOrganization): OrganizationResponse {
  return new OrganizationResponse(
    organization._id.toString(),
    organization.name,
    organization.slug,
    organization.status,
    organization.plan,
    organization.createdAt,
  );
}
