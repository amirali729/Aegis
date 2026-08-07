export class ProfileResponse {
  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly email: string,
    public readonly fullName: string | undefined,
    public readonly bio: string | undefined,
    public readonly avatarUrl: string | undefined,
    public readonly jobTitle: string | undefined,
    public readonly company: string | undefined,
    public readonly website: string | undefined,
    public readonly location: string | undefined,
    public readonly updatedAt: Date,
  ) {}
}
