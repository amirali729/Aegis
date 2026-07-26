import type { HttpClient } from '../http-client.js';
import type { Role } from '../types.js';

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

export class RolesModule {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Role[]> {
    return this.http.request<Role[]>('GET', '/roles');
  }

  async get(id: string): Promise<Role> {
    return this.http.request<Role>('GET', `/roles/${id}`);
  }

  async create(input: CreateRoleInput): Promise<Role> {
    return this.http.request<Role>('POST', '/roles', {
      body: input,
    });
  }

  async update(id: string, input: UpdateRoleInput): Promise<Role> {
    return this.http.request<Role>('PATCH', `/roles/${id}`, { body: input });
  }

  async setPermissions(id: string, permissionIds: string[]): Promise<Role> {
    return this.http.request<Role>('PUT', `/roles/${id}/permissions`, { body: { permissionIds } });
  }

  async delete(id: string): Promise<void> {
    await this.http.request('DELETE', `/roles/${id}`);
  }

  async assignToUser(userId: string, roleId: string): Promise<{ userId: string; roles: string[] }> {
    return this.http.request('POST', `/users/${userId}/roles`, { body: { roleId } });
  }

  async removeFromUser(userId: string, roleId: string): Promise<void> {
    await this.http.request('DELETE', `/users/${userId}/roles/${roleId}`);
  }
}
