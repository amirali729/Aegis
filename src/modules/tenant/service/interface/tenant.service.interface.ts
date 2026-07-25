import type { CreateTenantDto } from '../../dto/create-tenant.dto.js';
import type { UpdateTenantDto } from '../../dto/update-tenant.dto.js';
import type {
  DeleteTenantResult,
  TenantListResult,
  TenantResult,
} from '../../types/tenant.types.js';

export interface ITenantService {
  list(): Promise<TenantListResult>;

  getById(id: string): Promise<TenantResult>;

  create(dto: CreateTenantDto): Promise<TenantResult>;

  update(id: string, dto: UpdateTenantDto): Promise<TenantResult>;

  delete(id: string): Promise<DeleteTenantResult>;
}
