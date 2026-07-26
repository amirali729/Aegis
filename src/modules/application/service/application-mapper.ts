import type { IApplication } from '../model/application.model.js';
import { ApplicationResponse } from '../responses/application.response.js';

export function toApplicationResponse(application: IApplication): ApplicationResponse {
  return new ApplicationResponse(
    application._id.toString(),
    application.tenantId?.toString(),
    application.name,
    application.clientId,
    application.allowedOrigins,
    application.redirectUris,
    application.accessTokenTTL,
    application.refreshTokenTTL,
    application.isActive,
    application.createdAt,
  );
}
