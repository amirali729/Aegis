export class AssignRoleResponse {
  readonly kind = 'success';

  constructor(
    public readonly userId: string,
    public readonly roles: string[],
    public readonly message = 'Role updated successfully.',
  ) {}
}
