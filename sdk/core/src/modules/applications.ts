import type { HttpClient } from '../http-client.js';
import type { Application, ApplicationCreated, RegenerateSecretResult } from '../types.js';

export interface CreateApplicationInput {
  name: string;
  allowedOrigins?: string[];
  redirectUris?: string[];
  accessTokenTTL?: string;
  refreshTokenTTL?: string;
}

export interface UpdateApplicationInput {
  name?: string;
  allowedOrigins?: string[];
  redirectUris?: string[];
  accessTokenTTL?: string;
  refreshTokenTTL?: string;
  isActive?: boolean;
}

export class ApplicationsModule {
  constructor(private readonly http: HttpClient) {}

  private tenantHeaders(tenantId?: string): Record<string, string> {
    return tenantId ? { 'X-Tenant-ID': tenantId } : {};
  }

  async list(tenantId?: string): Promise<Application[]> {
    return this.http.request<Application[]>('GET', '/applications', {
      headers: this.tenantHeaders(tenantId),
    });
  }

  async get(id: string): Promise<Application> {
    return this.http.request<Application>('GET', `/applications/${id}`);
  }

  /** Returns the plaintext clientSecret exactly once - store it immediately. */
  async create(input: CreateApplicationInput, tenantId?: string): Promise<ApplicationCreated> {
    return this.http.request<ApplicationCreated>('POST', '/applications', {
      body: input,
      headers: this.tenantHeaders(tenantId),
    });
  }

  async update(id: string, input: UpdateApplicationInput): Promise<Application> {
    return this.http.request<Application>('PATCH', `/applications/${id}`, { body: input });
  }

  async delete(id: string): Promise<void> {
    await this.http.request('DELETE', `/applications/${id}`);
  }

  /** Invalidates the old secret immediately. Returns the new plaintext secret exactly once. */
  async regenerateSecret(id: string): Promise<RegenerateSecretResult> {
    return this.http.request<RegenerateSecretResult>(
      'POST',
      `/applications/${id}/regenerate-secret`,
    );
  }
}
