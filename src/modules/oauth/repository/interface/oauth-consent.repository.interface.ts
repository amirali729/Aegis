import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';
import type { IOAuthConsent } from '../../model/oauth-consent.model.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IOAuthConsentRepository {
  findOne(userId: string, clientId: string): Promise<DataResult<IOAuthConsent | null>>;

  /** Merges (unions) newScopes onto any existing record for (userId, clientId), creating one if none exists. */
  grantScopes(
    userId: string,
    clientId: string,
    newScopes: string[],
  ): Promise<DataResult<IOAuthConsent>>;
}
