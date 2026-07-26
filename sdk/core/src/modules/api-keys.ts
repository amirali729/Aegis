import type { HttpClient } from '../http-client.js';
import type { ApiKey, ApiKeyCreated } from '../types.js';

export interface CreateApiKeyInput {
  name: string;
  expiresInDays?: number;
}

export class ApiKeysModule {
  constructor(private readonly http: HttpClient) {}

  async list(applicationId: string): Promise<ApiKey[]> {
    return this.http.request<ApiKey[]>('GET', `/applications/${applicationId}/api-keys`);
  }

  /** Returns the plaintext key exactly once - store it immediately. */
  async create(applicationId: string, input: CreateApiKeyInput): Promise<ApiKeyCreated> {
    return this.http.request<ApiKeyCreated>('POST', `/applications/${applicationId}/api-keys`, {
      body: input,
    });
  }

  async revoke(applicationId: string, keyId: string): Promise<void> {
    await this.http.request('DELETE', `/applications/${applicationId}/api-keys/${keyId}`);
  }
}
