import type { Request, Response, NextFunction } from 'express';
import type { ITenantController } from './interface/tenant.controller.interface.js';
import type { ITenantService } from '../service/interface/tenant.service.interface.js';
import { CreateTenantDto } from '../dto/create-tenant.dto.js';
import { UpdateTenantDto } from '../dto/update-tenant.dto.js';
import type { DeleteTenantResult, TenantListResult, TenantResult } from '../types/tenant.types.js';

export class TenantController implements ITenantController {
  constructor(private readonly service: ITenantService) {}

  async list(_req: Request, _res: Response, _next: NextFunction): Promise<TenantListResult> {
    return this.service.list();
  }

  async getById(req: Request, _res: Response, _next: NextFunction): Promise<TenantResult> {
    return this.service.getById(req.params.id as string);
  }

  async create(req: Request, _res: Response, _next: NextFunction): Promise<TenantResult> {
    const dto = new CreateTenantDto(req.body.name, req.body.slug, req.body.plan ?? 'free');

    return this.service.create(dto);
  }

  async update(req: Request, _res: Response, _next: NextFunction): Promise<TenantResult> {
    const dto = new UpdateTenantDto(req.body.name, req.body.status, req.body.plan);

    return this.service.update(req.params.id as string, dto);
  }

  async delete(req: Request, _res: Response, _next: NextFunction): Promise<DeleteTenantResult> {
    return this.service.delete(req.params.id as string);
  }
}
