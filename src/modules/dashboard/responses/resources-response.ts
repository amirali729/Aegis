export class ResourcesResponse {
  constructor(
    /** Organizations the caller belongs to, regardless of tenant scope. */
    public readonly organizations: number,
    /** Everything below is scoped to the resolved tenant; all zero when no tenant is resolved. */
    public readonly applications: number,
    public readonly apiKeys: { active: number; revoked: number; total: number },
    public readonly roles: number,
    public readonly webhooks: number,
    public readonly scopedToOrganizationId: string | undefined,
  ) {}
}
