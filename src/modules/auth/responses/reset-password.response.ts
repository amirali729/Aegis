export class ResetPasswordResponse {
  readonly kind = 'success';

  constructor(
    public readonly message = 'Password has been reset successfully. Please log in with your new password.',
  ) {}
}
