import { UserResponse } from "./user.response.js"

export class SignUpResponse {
  readonly kind = "created";

  constructor(
    // public readonly user: Omit<IUser, "password" | "refreshToken">,
    public readonly user:UserResponse,
    public readonly message = "Account created successfully."
  ) {}
}