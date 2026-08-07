export class UpdateProfileDto {
  constructor(
    public readonly bio?: string,
    public readonly avatarUrl?: string,
    public readonly jobTitle?: string,
    public readonly company?: string,
    public readonly website?: string,
    public readonly location?: string,
  ) {}
}
