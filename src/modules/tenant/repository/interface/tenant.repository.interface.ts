import type { ITenant } from '../../model/tenant.model.js';
import type { Result } from '../../../../shared/result/result.js';
import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { CreateTenantDto } from '../../dto/create-tenant.dto.js';
import type { UpdateTenantDto } from '../../dto/update-tenant.dto.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface ITenantRepository {
  findAll(): Promise<DataResult<ITenant[]>>;

  findById(id: string): Promise<DataResult<ITenant | null>>;

  findBySlug(slug: string): Promise<DataResult<ITenant | null>>;

  create(dto: CreateTenantDto & { slug: string }): Promise<DataResult<ITenant>>;

  update(id: string, dto: UpdateTenantDto): Promise<DataResult<ITenant | null>>;

  delete(id: string): Promise<DataResult<boolean>>;
}
