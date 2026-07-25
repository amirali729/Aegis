export class ChangePasswordResponse {
  readonly kind = "success";

  constructor(
    public readonly message = "Password changed successfully."
  ) {}
}