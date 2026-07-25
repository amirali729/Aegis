export class VerifyEmailResponse {
  readonly kind = 'success';

  constructor(public readonly message = 'Email verified successfully.') {}
}
