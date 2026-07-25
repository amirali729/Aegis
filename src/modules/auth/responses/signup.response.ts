import type { UserResponse } from './user.response.js';

export class SignUpResponse {
  readonly kind = 'created';

  constructor(
    public readonly user: UserResponse,
    public readonly message = 'Account created successfully.',
  ) {}
}
