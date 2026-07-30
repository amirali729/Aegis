import type { NextFunction, Request, Response } from 'express';
import { CreateOrganizationDto } from '../dto/create-organization.dto.js';
import { UpdateOrganizationDto } from '../dto/update-organization.dto.js';
import type { IOrganizationService } from '../service/interface/organization.service.interface.js';
import type {
  DeleteOrganizationResult,
  OrganizationListResult,
  OrganizationResult,
} from '../types/organization.types.js';
import type { IOrganizationController } from './interface/organization.controller.interface.js';

export class OrganizationController implements IOrganizationController {
  constructor(private readonly service: IOrganizationService) {}

  async list(_req: Request, _res: Response, _next: NextFunction): Promise<OrganizationListResult> {
    return this.service.list();
  }

  async getById(req: Request, _res: Response, _next: NextFunction): Promise<OrganizationResult> {
    return this.service.getById(req.params.id as string);
  }

  async create(req: Request, _res: Response, _next: NextFunction): Promise<OrganizationResult> {
    const dto = new CreateOrganizationDto(req.body.name, req.body.slug, req.body.plan ?? 'free');

    return this.service.create(dto);
  }

  async update(req: Request, _res: Response, _next: NextFunction): Promise<OrganizationResult> {
    const dto = new UpdateOrganizationDto(req.body.name, req.body.status, req.body.plan);

    return this.service.update(req.params.id as string, dto);
  }

  async delete(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<DeleteOrganizationResult> {
    return this.service.delete(req.params.id as string);
  }
}
