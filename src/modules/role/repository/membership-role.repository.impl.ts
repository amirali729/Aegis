import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import { Membership } from '../../membership/model/membership.model.js';
import type {
  DataResult,
  IMembershipRoleRepository,
} from './interface/membership-role.repository.interface.js';

export class MembershipRoleRepository implements IMembershipRoleRepository {
  async findRoleIds(organizationId: string, userId: string): Promise<DataResult<string[] | null>> {
    try {
      const membership = await Membership.findOne({ organizationId, userId }).select('roleIds');
      if (!membership) {
        return ok(null);
      }
      return ok(membership.roleIds.map((id) => id.toString()));
    } catch {
      return err(new InfrastructureError());
    }
  }

  async addRole(
    organizationId: string,
    userId: string,
    roleId: string,
  ): Promise<DataResult<string[] | null>> {
    try {
      const membership = await Membership.findOneAndUpdate(
        { organizationId, userId },
        { $addToSet: { roleIds: roleId } },
        { new: true },
      ).select('roleIds');

      if (!membership) {
        return ok(null);
      }

      return ok(membership.roleIds.map((id) => id.toString()));
    } catch {
      return err(new InfrastructureError());
    }
  }

  async removeRole(
    organizationId: string,
    userId: string,
    roleId: string,
  ): Promise<DataResult<string[] | null>> {
    try {
      const membership = await Membership.findOneAndUpdate(
        { organizationId, userId },
        { $pull: { roleIds: roleId } },
        { new: true },
      ).select('roleIds');

      if (!membership) {
        return ok(null);
      }

      return ok(membership.roleIds.map((id) => id.toString()));
    } catch {
      return err(new InfrastructureError());
    }
  }
}
