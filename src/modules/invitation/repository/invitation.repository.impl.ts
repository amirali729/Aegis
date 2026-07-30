import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { IInvitation } from '../model/invitation.model.js';
import { Invitation } from '../model/invitation.model.js';
import type {
  DataResult,
  IInvitationRepository,
} from './interface/invitation.repository.interface.js';

export class InvitationRepository implements IInvitationRepository {
  async findByOrganization(organizationId: string): Promise<DataResult<IInvitation[]>> {
    try {
      const invitations = await Invitation.find({ organizationId }).sort({ createdAt: -1 });
      return ok(invitations);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findPendingByEmail(
    organizationId: string,
    email: string,
  ): Promise<DataResult<IInvitation | null>> {
    try {
      const invitation = await Invitation.findOne({
        organizationId,
        email: email.toLowerCase().trim(),
        status: 'pending',
      });
      return ok(invitation);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByTokenHash(tokenHash: string): Promise<DataResult<IInvitation | null>> {
    try {
      const invitation = await Invitation.findOne({ tokenHash });
      return ok(invitation);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findById(id: string): Promise<DataResult<IInvitation | null>> {
    try {
      const invitation = await Invitation.findById(id);
      return ok(invitation);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async create(params: {
    organizationId: string;
    email: string;
    tokenHash: string;
    invitedBy?: string;
    expiresAt: Date;
  }): Promise<DataResult<IInvitation>> {
    try {
      const invitation = await Invitation.create({
        organizationId: params.organizationId,
        email: params.email.toLowerCase().trim(),
        tokenHash: params.tokenHash,
        invitedBy: params.invitedBy,
        expiresAt: params.expiresAt,
      });
      return ok(invitation);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async updateStatus(
    id: string,
    status: IInvitation['status'],
  ): Promise<DataResult<IInvitation | null>> {
    try {
      const invitation = await Invitation.findByIdAndUpdate(id, { status }, { new: true });
      return ok(invitation);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async delete(id: string): Promise<DataResult<boolean>> {
    try {
      const result = await Invitation.findByIdAndDelete(id);
      return ok(!!result);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
