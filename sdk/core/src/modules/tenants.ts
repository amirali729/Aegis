import type { HttpClient } from '../http-client.js';
import type { Tenant } from '../types.js';

export interface CreateTenantInput {
  name: string;
  slug?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

export interface UpdateTenantInput {
  name?: string;
  status?: 'active' | 'suspended';
  plan?: 'free' | 'pro' | 'enterprise';
}

export class TenantsModule {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Tenant[]> {
    return this.http.request<Tenant[]>('GET', '/tenants');
  }

  async get(id: string): Promise<Tenant> {
    return this.http.request<Tenant>('GET', `/tenants/${id}`);
  }

  async create(input: CreateTenantInput): Promise<Tenant> {
    return this.http.request<Tenant>('POST', '/tenants', {
      body: input,
    });
  }

  async update(id: string, input: UpdateTenantInput): Promise<Tenant> {
    return this.http.request<Tenant>('PATCH', `/tenants/${id}`, { body: input });
  }

  async delete(id: string): Promise<void> {
    await this.http.request('DELETE', `/tenants/${id}`);
  }
}
