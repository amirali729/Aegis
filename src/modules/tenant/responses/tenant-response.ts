export class TenantResponse {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly status: 'active' | 'suspended',
    public readonly plan: 'free' | 'pro' | 'enterprise',
    public readonly createdAt: Date,
  ) {}
}
