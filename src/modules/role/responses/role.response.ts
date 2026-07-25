export class RoleResponse {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly isSystem: boolean,
    public readonly permissions: string[],
    public readonly createdAt: Date,
  ) {}
}
