import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { CreateOrganizationDto } from '../dto/create-organization.dto.js';
import type { UpdateOrganizationDto } from '../dto/update-organization.dto.js';
import type { IOrganization } from '../model/organization.model.js';
import { Tenant } from '../model/organization.model.js';
import type {
  DataResult,
  IOrganizationRepository,
} from './interface/organization.repository.interface.js';

export class OrganizationRepository implements IOrganizationRepository {
  async findAll(): Promise<DataResult<IOrganization[]>> {
    try {
      const tenants = await Tenant.find().sort({
        name: 1,
      });
      return ok(tenants);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findById(id: string): Promise<DataResult<IOrganization | null>> {
    try {
      const tenant = await Tenant.findById(id);
      return ok(tenant);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findBySlug(slug: string): Promise<DataResult<IOrganization | null>> {
    try {
      const tenant = await Tenant.findOne({ slug });
      return ok(tenant);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async create(dto: CreateOrganizationDto & { slug: string }): Promise<DataResult<IOrganization>> {
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

  async update(id: string, dto: UpdateOrganizationDto): Promise<DataResult<IOrganization | null>> {
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
