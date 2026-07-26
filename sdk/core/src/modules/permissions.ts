import type { HttpClient } from '../http-client.js';
import type { Permission } from '../types.js';

export interface CreatePermissionInput {
  key: string;
  description?: string;
}

export class PermissionsModule {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Permission[]> {
    return this.http.request<Permission[]>('GET', '/permissions');
  }

  async get(id: string): Promise<Permission> {
    return this.http.request<Permission>('GET', `/permissions/${id}`);
  }

  async create(input: CreatePermissionInput): Promise<Permission> {
    return this.http.request<Permission>('POST', '/permissions', { body: input });
  }

  async update(id: string, description: string): Promise<Permission> {
    return this.http.request<Permission>('PATCH', `/permissions/${id}`, { body: { description } });
  }

  async delete(id: string): Promise<void> {
    await this.http.request('DELETE', `/permissions/${id}`);
  }
}
