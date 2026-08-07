import type { CreateOrganizationDto } from '../../dto/create-organization.dto.js';
import type { UpdateOrganizationDto } from '../../dto/update-organization.dto.js';
import type {
  DeleteOrganizationResult,
  OrganizationListResult,
  OrganizationMembershipListResult,
  OrganizationResult,
} from '../../types/organization.types.js';

export interface IOrganizationService {
  list(): Promise<OrganizationListResult>;

  /** Every organization the given user belongs to, with their org-scoped roles. */
  listMine(userId: string): Promise<OrganizationMembershipListResult>;

  getById(
    id: string,
    callerTenantId: string | undefined,
    callerId: string,
  ): Promise<OrganizationResult>;

  create(dto: CreateOrganizationDto, actorId?: string): Promise<OrganizationResult>;

  update(
    id: string,
    dto: UpdateOrganizationDto,
    callerTenantId: string | undefined,
    callerId: string,
    actorId?: string,
  ): Promise<OrganizationResult>;

  delete(
    id: string,
    callerTenantId: string | undefined,
    callerId: string,
    actorId?: string,
  ): Promise<DeleteOrganizationResult>;
}
