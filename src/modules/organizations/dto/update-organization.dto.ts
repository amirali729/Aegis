export class UpdateOrganizationDto {
  constructor(
    public readonly name?: string,
    public readonly status?: 'active' | 'suspended',
    public readonly plan?: 'free' | 'pro' | 'enterprise',
  ) {}
}
