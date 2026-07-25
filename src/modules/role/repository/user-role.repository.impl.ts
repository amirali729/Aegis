import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import { User } from '../../auth/model/user.model.js';
import type {
  DataResult,
  IUserRoleRepository,
} from './interface/user-role.repository.interface.js';

export class UserRoleRepository implements IUserRoleRepository {
  async findUserRoleIds(userId: string): Promise<DataResult<string[] | null>> {
    try {
      const user = await User.findById(userId).select('roles');
      if (!user) {
        return ok(null);
      }
      return ok(user.roles.map((id) => id.toString()));
    } catch {
      return err(new InfrastructureError());
    }
  }

  async addRole(userId: string, roleId: string): Promise<DataResult<string[] | null>> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { roles: roleId } },
        { new: true },
      ).select('roles');

      if (!user) {
        return ok(null);
      }

      return ok(user.roles.map((id) => id.toString()));
    } catch {
      return err(new InfrastructureError());
    }
  }

  async removeRole(userId: string, roleId: string): Promise<DataResult<string[] | null>> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { roles: roleId } },
        { new: true },
      ).select('roles');

      if (!user) {
        return ok(null);
      }

      return ok(user.roles.map((id) => id.toString()));
    } catch {
      return err(new InfrastructureError());
    }
  }
}
