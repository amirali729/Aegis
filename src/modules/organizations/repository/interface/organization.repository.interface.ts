import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { Result } from '../../../../shared/result/result.js';
import type { CreateOrganizationDto } from '../../dto/create-organization.dto.js';
import type { UpdateOrganizationDto } from '../../dto/update-organization.dto.js';
import type { IOrganization } from '../../model/organization.model.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IOrganizationRepository {
  findAll(): Promise<DataResult<IOrganization[]>>;

  findById(id: string): Promise<DataResult<IOrganization | null>>;

  findBySlug(slug: string): Promise<DataResult<IOrganization | null>>;

  create(dto: CreateOrganizationDto & { slug: string }): Promise<DataResult<IOrganization>>;

  update(id: string, dto: UpdateOrganizationDto): Promise<DataResult<IOrganization | null>>;

  delete(id: string): Promise<DataResult<boolean>>;
}
