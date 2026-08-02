import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { IOAuthConsent } from '../model/oauth-consent.model.js';
import { OAuthConsent } from '../model/oauth-consent.model.js';
import type {
  DataResult,
  IOAuthConsentRepository,
} from './interface/oauth-consent.repository.interface.js';

export class OAuthConsentRepository implements IOAuthConsentRepository {
  async findOne(userId: string, clientId: string): Promise<DataResult<IOAuthConsent | null>> {
    try {
      const consent = await OAuthConsent.findOne({ userId, clientId });
      return ok(consent);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async grantScopes(
    userId: string,
    clientId: string,
    newScopes: string[],
  ): Promise<DataResult<IOAuthConsent>> {
    try {
      const consent = await OAuthConsent.findOneAndUpdate(
        { userId, clientId },
        { $addToSet: { scopes: { $each: newScopes } } },
        { new: true, upsert: true },
      );
      return ok(consent);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
