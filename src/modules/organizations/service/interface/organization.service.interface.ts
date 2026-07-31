import type { CreateOrganizationDto } from '../../dto/create-organization.dto.js';
import type { UpdateOrganizationDto } from '../../dto/update-organization.dto.js';
import type {
  DeleteOrganizationResult,
  OrganizationListResult,
  OrganizationResult,
} from '../../types/organization.types.js';

export interface IOrganizationService {
  list(): Promise<OrganizationListResult>;

  getById(id: string, callerTenantId: string | undefined): Promise<OrganizationResult>;

  create(dto: CreateOrganizationDto, actorId?: string): Promise<OrganizationResult>;

  update(
    id: string,
    dto: UpdateOrganizationDto,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<OrganizationResult>;

  delete(
    id: string,
    callerTenantId: string | undefined,
    actorId?: string,
  ): Promise<DeleteOrganizationResult>;
}
