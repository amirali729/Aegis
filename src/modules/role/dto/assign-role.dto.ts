export class AssignRoleDto {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly roleId: string,
  ) {}
}
