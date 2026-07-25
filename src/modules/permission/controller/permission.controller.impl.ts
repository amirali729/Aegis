import type { Request, Response, NextFunction } from 'express';
import type { IPermissionController } from './interface/permission.controller.interface.js';
import type { IPermissionService } from '../service/interface/permission.service.interface.js';
import { CreatePermissionDto } from '../dto/create-permission.dto.js';
import { UpdatePermissionDto } from '../dto/update-permission.dto.js';
import type {
  DeletePermissionResult,
  PermissionListResult,
  PermissionResult,
} from '../types/permission.types.js';

export class PermissionController implements IPermissionController {
  constructor(private readonly service: IPermissionService) {}

  async list(_req: Request, _res: Response, _next: NextFunction): Promise<PermissionListResult> {
    return this.service.list();
  }

  async getById(req: Request, _res: Response, _next: NextFunction): Promise<PermissionResult> {
    return this.service.getById(req.params.id as string);
  }

  async create(req: Request, _res: Response, _next: NextFunction): Promise<PermissionResult> {
    const dto = new CreatePermissionDto(req.body.key, req.body.description);

    return this.service.create(dto);
  }

  async update(req: Request, _res: Response, _next: NextFunction): Promise<PermissionResult> {
    const dto = new UpdatePermissionDto(req.body.description);

    return this.service.update(req.params.id as string, dto);
  }

  async delete(req: Request, _res: Response, _next: NextFunction): Promise<DeletePermissionResult> {
    return this.service.delete(req.params.id as string);
  }
}
