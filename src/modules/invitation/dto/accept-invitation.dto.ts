export class AcceptInvitationDto {
  constructor(
    public readonly token: string,
    /** Required only if no account exists yet for the invited email. */
    public readonly username?: string,
    public readonly password?: string,
  ) {}
}
