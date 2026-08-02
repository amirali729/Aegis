import type { AuthorizeResult } from '../../types/authorize.types.js';
import type { AuthorizeQuery } from '../../validation/authorize.schemas.js';

export interface IAuthorizeService {
  authorize(
    query: AuthorizeQuery,
    currentUserId: string | undefined,
    originalRequestUrl: string,
  ): Promise<AuthorizeResult>;

  /** Called by POST /oauth/consent/decision once the user approves/denies on the frontend consent page. */
  decideConsent(query: AuthorizeQuery, approved: boolean, userId: string): Promise<AuthorizeResult>;
}
