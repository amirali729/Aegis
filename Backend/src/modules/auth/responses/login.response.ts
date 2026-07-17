import { UserResponse } from "./user.response.js";

export class LoginResponse {
  readonly kind = "success";

constructor(
    public readonly user: UserResponse,
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly message = "User logged in successfully."
) {}
}