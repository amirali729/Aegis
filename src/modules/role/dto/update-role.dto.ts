export class UpdateRoleDto {
  constructor(
    public readonly name?: string,
    public readonly description?: string,
  ) {}
}
