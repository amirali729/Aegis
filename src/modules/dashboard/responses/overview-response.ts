export interface CurrentOrganizationSummary {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  roles: string[];
}

export class OverviewResponse {
  constructor(
    public readonly user: {
      id: string;
      username: string;
      email: string;
      fullName: string | undefined;
      isVerified: boolean;
      createdAt: Date;
    },
    /** How many organizations the caller belongs to, across all of them. */
    public readonly organizationsCount: number,
    /** Only populated when the request resolved a tenant (X-Tenant-ID). */
    public readonly currentOrganization: CurrentOrganizationSummary | undefined,
    /** Active-member count of the current organization. Undefined with no resolved tenant. */
    public readonly membersCount: number | undefined,
    public readonly applicationsCount: number | undefined,
    public readonly rolesCount: number | undefined,
  ) {}
}
