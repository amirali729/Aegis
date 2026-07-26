import type { IApiKey } from '../model/api-key.model.js';
import { ApiKeyResponse } from '../responses/api-key.response.js';

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
