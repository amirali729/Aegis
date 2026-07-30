export class MemberResponse {
  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly email: string,
    public readonly status: 'active' | 'suspended',
    public readonly joinedAt: Date,
  ) {}
}
