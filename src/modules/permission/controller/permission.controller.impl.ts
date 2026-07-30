import type { NextFunction, Request, Response } from 'express';
import { CreatePermissionDto } from '../dto/create-permission.dto.js';
import { UpdatePermissionDto } from '../dto/update-permission.dto.js';
import type { IPermissionService } from '../service/interface/permission.service.interface.js';
import type {
  DeletePermissionResult,
  PermissionListResult,
  PermissionResult,
} from '../types/permission.types.js';
import type { IPermissionController } from './interface/permission.controller.interface.js';

export class PermissionController implements IPermissionController {
  constructor(private readonly service: IPermissionService) {}

  async list(req: Request, _res: Response, _next: NextFunction): Promise<PermissionListResult> {
    return this.service.list(req.tenantId);
  }

  async getById(req: Request, _res: Response, _next: NextFunction): Promise<PermissionResult> {
    return this.service.getById(req.params.id as string);
  }

  async create(req: Request, _res: Response, _next: NextFunction): Promise<PermissionResult> {
    const dto = new CreatePermissionDto(req.body.key, req.body.description);

    return this.service.create(dto, req.tenantId, req.user?._id?.toString());
  }

  async update(req: Request, _res: Response, _next: NextFunction): Promise<PermissionResult> {
    const dto = new UpdatePermissionDto(req.body.description);

    return this.service.update(req.params.id as string, dto, req.user?._id?.toString());
  }

  async delete(req: Request, _res: Response, _next: NextFunction): Promise<DeletePermissionResult> {
    return this.service.delete(req.params.id as string, req.user?._id?.toString());
  }
}
