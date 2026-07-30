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
  ): Promise<DataResult<IMembership>> {
    try {
      const membership = await Membership.create({ organizationId, userId, status });
      return ok(membership);
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
}
