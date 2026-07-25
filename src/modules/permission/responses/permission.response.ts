export class PermissionResponse {
  constructor(
    public readonly id: string,
    public readonly key: string,
    public readonly description: string | undefined,
    public readonly createdAt: Date,
  ) {}
}
