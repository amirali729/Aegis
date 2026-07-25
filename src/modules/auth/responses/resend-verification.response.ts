export class ResendVerificationResponse {
  readonly kind = 'success';

  constructor(
    public readonly message = 'If an account with that email exists and is unverified, a new verification email has been sent.',
  ) {}
}
