import { ApiKeyResponse } from './api-key.response.js';

export class ApiKeyCreatedResponse extends ApiKeyResponse {
  constructor(
    apiKey: ApiKeyResponse,
    public readonly key: string,
    public readonly warning: string = 'Store this API key now - it will not be shown again.',
  ) {
    super(
      apiKey.id,
      apiKey.applicationId,
      apiKey.name,
      apiKey.keyPrefix,
      apiKey.status,
      apiKey.expiresAt,
      apiKey.lastUsedAt,
      apiKey.createdAt,
    );
  }
}
