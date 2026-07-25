import type { IDefaultRoleProvider } from '../../auth/service/interface/default-role-provider.interface.js';
import { Role } from '../models/role.model.js';

const DEFAULT_ROLE_NAME = 'User';

export class DefaultRoleProvider implements IDefaultRoleProvider {
  private cachedRoleId: string | null = null;

  async getDefaultRoleId(): Promise<string | null> {
    if (this.cachedRoleId) {
      return this.cachedRoleId;
    }

    const role = await Role.findOne({
      name: DEFAULT_ROLE_NAME,
    }).select('_id');

    if (!role) {
      // RBAC hasn't been seeded yet (`npm run seed:rbac`) - signup
      // still succeeds, just without a default role assigned.
      return null;
    }

    this.cachedRoleId = role._id.toString();
    return this.cachedRoleId;
  }
}
