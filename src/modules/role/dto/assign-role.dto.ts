export class AssignRoleDto {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
  ) {}
}
