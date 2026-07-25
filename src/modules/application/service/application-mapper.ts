import type { IApplication } from '../model/application.model.js';
import type { IApiKey } from '../model/api-key.model.js';
import { ApplicationResponse } from '../responses/application.response.js';
import { ApiKeyResponse } from '../responses/api-key.response.js';

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

export function toApiKeyResponse(apiKey: IApiKey): ApiKeyResponse {
  return new ApiKeyResponse(
    apiKey._id.toString(),
    apiKey.applicationId.toString(),
    apiKey.name,
    apiKey.keyPrefix,
    apiKey.status,
    apiKey.expiresAt,
    apiKey.lastUsedAt,
    apiKey.createdAt,
  );
}
