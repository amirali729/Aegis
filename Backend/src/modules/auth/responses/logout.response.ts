export class LogoutResponse {
  readonly kind = "success";

  constructor(
    public readonly message = "User logged out successfully."
  ) {}
}