export class CreatePermissionDto {
  constructor(
    public readonly key: string,
    public readonly description?: string,
    public readonly tenantId?: string,
  ) {}
}
