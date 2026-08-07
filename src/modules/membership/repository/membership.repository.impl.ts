import type { ClientSession } from 'mongoose';
import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { IMembership, MembershipStatus } from '../model/membership.model.js';
import { Membership } from '../model/membership.model.js';
import type {
  DataResult,
  IMembershipRepository,
} from './interface/membership.repository.interface.js';

export class MembershipRepository implements IMembershipRepository {
  async findByOrganization(organizationId: string): Promise<DataResult<IMembership[]>> {
    try {
      const memberships = await Membership.find({ organizationId })
        .populate('userId')
        .sort({ joinedAt: 1 });
      return ok(memberships);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByUser(userId: string): Promise<DataResult<IMembership[]>> {
    try {
      const memberships = await Membership.find({ userId })
        .populate('organizationId')
        .populate('roleIds', 'name description')
        .sort({ joinedAt: 1 });
      return ok(memberships);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findOne(organizationId: string, userId: string): Promise<DataResult<IMembership | null>> {
    try {
      const membership = await Membership.findOne({ organizationId, userId }).populate('userId');
      return ok(membership);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async create(
    organizationId: string,
    userId: string,
    status: MembershipStatus = 'active',
    session?: ClientSession,
  ): Promise<DataResult<IMembership>> {
    try {
      const membership = await Membership.create([{ organizationId, userId, status }], {
        session,
      });
      return ok(membership[0]!);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async updateStatus(
    organizationId: string,
    userId: string,
    status: MembershipStatus,
  ): Promise<DataResult<IMembership | null>> {
    try {
      const membership = await Membership.findOneAndUpdate(
        { organizationId, userId },
        { status },
        { new: true },
      ).populate('userId');
      return ok(membership);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async delete(organizationId: string, userId: string): Promise<DataResult<boolean>> {
    try {
      const result = await Membership.findOneAndDelete({ organizationId, userId });
      return ok(!!result);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async deleteAllForUser(userId: string): Promise<DataResult<number>> {
    try {
      const result = await Membership.deleteMany({ userId });
      return ok(result.deletedCount ?? 0);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async addRole(
    organizationId: string,
    userId: string,
    roleId: string,
    session?: ClientSession,
  ): Promise<DataResult<IMembership | null>> {
    try {
      const membership = await Membership.findOneAndUpdate(
        { organizationId, userId },
        { $addToSet: { roleIds: roleId } },
        { new: true, session },
      );
      return ok(membership);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async removeRole(
    organizationId: string,
    userId: string,
    roleId: string,
  ): Promise<DataResult<IMembership | null>> {
    try {
      const membership = await Membership.findOneAndUpdate(
        { organizationId, userId },
        { $pull: { roleIds: roleId } },
        { new: true },
      );
      return ok(membership);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
