export class CreateOrganizationDto {
  constructor(
    public readonly name: string,
    public readonly slug?: string,
    public readonly plan: 'free' | 'pro' | 'enterprise' = 'free',
  ) {}
}
