import { ValidationError } from '../../../shared/errors/validation.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { CreateOrganizationDto } from '../dto/create-organization.dto.js';
import type { UpdateOrganizationDto } from '../dto/update-organization.dto.js';
import { OrganizationNotFoundError } from '../errors/organization-not-found.error.js';
import { OrganizationSlugTakenError } from '../errors/organization-slug-taken.error.js';
import type { IOrganizationRepository } from '../repository/interface/organization.repository.interface.js';
import type {
  DeleteOrganizationResult,
  OrganizationListResult,
  OrganizationResult,
} from '../types/organization.types.js';
import type { IOrganizationService } from './interface/organization.service.interface.js';
import { toOrganizationResponse } from './organization-mapper.js';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class OrganizationService implements IOrganizationService {
  constructor(private readonly repository: IOrganizationRepository) {}

  async list(): Promise<OrganizationListResult> {
    const found = await this.repository.findAll();

    if (!found.ok) {
      return err(found.error);
    }

    return ok(found.value.map(toOrganizationResponse));
  }

  async getById(id: string): Promise<OrganizationResult> {
    const found = await this.repository.findById(id);

    if (!found.ok) {
      return err(found.error);
    }

    if (!found.value) {
      return err(new OrganizationNotFoundError());
    }

    return ok(toOrganizationResponse(found.value));
  }

  async create(dto: CreateOrganizationDto): Promise<OrganizationResult> {
    const baseSlug = slugify(dto.slug ?? dto.name);

    if (!baseSlug) {
      return err(new ValidationError('Could not derive a valid slug from the tenant name.'));
    }

    const existing = await this.repository.findBySlug(baseSlug);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (existing.value) {
      return err(new OrganizationSlugTakenError());
    }

    const created = await this.repository.create({
      ...dto,
      slug: baseSlug,
    });

    if (!created.ok) {
      return err(created.error);
    }

    return ok(toOrganizationResponse(created.value));
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationResult> {
    const existing = await this.repository.findById(id);

    if (!existing.ok) {
      return err(existing.error);
    }

    if (!existing.value) {
      return err(new OrganizationNotFoundError());
    }

    const updated = await this.repository.update(id, dto);

    if (!updated.ok) {
      return err(updated.error);
    }

    if (!updated.value) {
      return err(new OrganizationNotFoundError());
    }

    return ok(toOrganizationResponse(updated.value));
  }

  async delete(id: string): Promise<DeleteOrganizationResult> {
    const deleted = await this.repository.delete(id);

    if (!deleted.ok) {
      return err(deleted.error);
    }

    if (!deleted.value) {
      return err(new OrganizationNotFoundError());
    }

    return ok({ message: 'Tenant deleted successfully.' });
  }
}
