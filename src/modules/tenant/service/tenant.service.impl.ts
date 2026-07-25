import { err, ok } from '../../../shared/result/result.js';
import { ValidationError } from '../../../shared/errors/validation.error.js';
import type { CreateTenantDto } from '../dto/create-tenant.dto.js';
import type { UpdateTenantDto } from '../dto/update-tenant.dto.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { TenantSlugTakenError } from '../errors/tenant-slug-taken.error.js';
import type { ITenantRepository } from '../repository/interface/tenant.repository.interface.js';
import type { DeleteTenantResult, TenantListResult, TenantResult } from '../types/tenant.types.js';
import type { ITenantService } from './interface/tenant.service.interface.js';
import { toTenantResponse } from './tenant-mapper.js';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class TenantService implements ITenantService {
  constructor(private readonly repository: ITenantRepository) {}

  async list(): Promise<TenantListResult> {
    const found = await this.repository.findAll();

    if (!found.ok) {
      return err(found.error);
    }

    return ok(found.value.map(toTenantResponse));
  }

  async getById(id: string): Promise<TenantResult> {
    const found = await this.repository.findById(id);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new TenantNotFoundError());
    }

    return ok(toTenantResponse(found.value));
  }

  async create(dto: CreateTenantDto): Promise<TenantResult> {
    const baseSlug = slugify(dto.slug ?? dto.name);

    if (!baseSlug) {
      return err(new ValidationError('Could not derive a valid slug from the tenant name.'));
    }

    const existing = await this.repository.findBySlug(baseSlug);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (existing.value) {
      return err(new TenantSlugTakenError());
    }

    const created = await this.repository.create({
      ...dto,
      slug: baseSlug,
    });

    if (!created.ok) {
      return err(created.error);
    }

    return ok(toTenantResponse(created.value));
  }

  async update(id: string, dto: UpdateTenantDto): Promise<TenantResult> {
    const existing = await this.repository.findById(id);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (!existing.value) {
      return err(new TenantNotFoundError());
    }

    const updated = await this.repository.update(id, dto);

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new TenantNotFoundError());
    }

    return ok(toTenantResponse(updated.value));
  }

  async delete(id: string): Promise<DeleteTenantResult> {
    const deleted = await this.repository.delete(id);

    if (!deleted.ok) {
      return err(deleted.error);
    }

    if (!deleted.value) {
      return err(new TenantNotFoundError());
    }

    return ok({ message: 'Tenant deleted successfully.' });
  }
}
