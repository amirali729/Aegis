import type { UserResponse } from './user.response.js';

export class LoginResponse {
  readonly kind = 'success';

  constructor(
    public readonly user: UserResponse,

    public readonly accessToken: string,

    public readonly refreshToken: string,

    /**
     * The caller's effective permission keys, resolved the same way
     * requirePermission checks them (see permission-evaluator.ts) - the
     * frontend can use this directly for nav/feature visibility instead
     * of guessing from role names. Empty for a brand-new signup with no
     * roles/org membership yet; re-fetch via GET /auth/me after
     * creating or joining an organization to pick up new permissions
     * without logging in again.
     */
    public readonly permissions: string[] = [],

    public readonly message = 'Login successful',
  ) {}
}
