export class OrganizationMembershipResponse {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly status: 'active' | 'suspended',
    public readonly plan: 'free' | 'pro' | 'enterprise',
    public readonly membershipStatus: 'active' | 'suspended',
    public readonly roles: { id: string; name: string }[],
    public readonly joinedAt: Date,
  ) {}
}
