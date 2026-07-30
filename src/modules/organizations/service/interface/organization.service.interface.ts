import type { CreateOrganizationDto } from '../../dto/create-organization.dto.js';
import type { UpdateOrganizationDto } from '../../dto/update-organization.dto.js';
import type {
  DeleteOrganizationResult,
  OrganizationListResult,
  OrganizationResult,
} from '../../types/organization.types.js';

export interface IOrganizationService {
  list(): Promise<OrganizationListResult>;

  getById(id: string): Promise<OrganizationResult>;

  create(dto: CreateOrganizationDto): Promise<OrganizationResult>;

  update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationResult>;

  delete(id: string): Promise<DeleteOrganizationResult>;
}
