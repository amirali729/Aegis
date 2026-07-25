import type { ITenant } from '../model/tenant.model.js';
import { TenantResponse } from '../responses/tenant-response.js';

export function toTenantResponse(tenant: ITenant): TenantResponse {
  return new TenantResponse(
    tenant._id.toString(),
    tenant.name,
    tenant.slug,
    tenant.status,
    tenant.plan,
    tenant.createdAt,
  );
}
