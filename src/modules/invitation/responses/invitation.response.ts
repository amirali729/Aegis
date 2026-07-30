export class InvitationResponse {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly email: string,
    public readonly status: 'pending' | 'accepted' | 'revoked' | 'expired',
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
  ) {}
}
