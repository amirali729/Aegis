import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { CreateTenantDto } from '../dto/create-tenant.dto.js';
import type { UpdateTenantDto } from '../dto/update-tenant.dto.js';
import type { ITenant } from '../model/tenant.model.js';
import { Tenant } from '../model/tenant.model.js';
import type { DataResult, ITenantRepository } from './interface/tenant.repository.interface.js';

export class TenantRepository implements ITenantRepository {
  async findAll(): Promise<DataResult<ITenant[]>> {
    try {
      const tenants = await Tenant.find().sort({
        name: 1,
      });
      return ok(tenants);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findById(id: string): Promise<DataResult<ITenant | null>> {
    try {
      const tenant = await Tenant.findById(id);
      return ok(tenant);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findBySlug(slug: string): Promise<DataResult<ITenant | null>> {
    try {
      const tenant = await Tenant.findOne({ slug });
      return ok(tenant);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async create(dto: CreateTenantDto & { slug: string }): Promise<DataResult<ITenant>> {
    try {
      const tenant = await Tenant.create({
        name: dto.name,
        slug: dto.slug,
        plan: dto.plan,
      });
      return ok(tenant);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async update(id: string, dto: UpdateTenantDto): Promise<DataResult<ITenant | null>> {
    try {
      const tenant = await Tenant.findByIdAndUpdate(
        id,
        {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.status !== undefined && {
            status: dto.status,
          }),
          ...(dto.plan !== undefined && { plan: dto.plan }),
        },
        { new: true },
      );
      return ok(tenant);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async delete(id: string): Promise<DataResult<boolean>> {
    try {
      const result = await Tenant.findByIdAndDelete(id);
      return ok(!!result);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
