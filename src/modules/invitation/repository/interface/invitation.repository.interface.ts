import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';
import type { IInvitation } from '../../model/invitation.model.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IInvitationRepository {
  findByOrganization(organizationId: string): Promise<DataResult<IInvitation[]>>;

  findPendingByEmail(
    organizationId: string,
    email: string,
  ): Promise<DataResult<IInvitation | null>>;

  findByTokenHash(tokenHash: string): Promise<DataResult<IInvitation | null>>;

  findById(id: string): Promise<DataResult<IInvitation | null>>;

  create(params: {
    organizationId: string;
    email: string;
    tokenHash: string;
    invitedBy?: string;
    expiresAt: Date;
  }): Promise<DataResult<IInvitation>>;

  updateStatus(id: string, status: IInvitation['status']): Promise<DataResult<IInvitation | null>>;

  delete(id: string): Promise<DataResult<boolean>>;
}
