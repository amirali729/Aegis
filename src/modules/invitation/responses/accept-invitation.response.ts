export class AcceptInvitationResponse {
  constructor(
    public readonly organizationId: string,
    public readonly userId: string,
    public readonly message: string = 'Invitation accepted successfully.',
  ) {}
}
