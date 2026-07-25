import type { Request, Response, NextFunction } from 'express';
import type { IRoleController } from './interface/role.controller.interface.js';
import type { IRoleService } from '../service/interface/role.service.interface.js';
import { CreateRoleDto } from '../dto/create-role.dto.js';
import { UpdateRoleDto } from '../dto/update-role.dto.js';
import { SetRolePermissionsDto } from '../dto/set-role-permission.dto.js';
import { AssignRoleDto } from '../dto/assign-role.dto.js';
import type {
  AssignRoleResult,
  DeleteRoleResult,
  RoleListResult,
  RoleResult,
} from '../types/role.types.js';

export class RoleController implements IRoleController {
  constructor(private readonly service: IRoleService) {}

  async list(_req: Request, _res: Response, _next: NextFunction): Promise<RoleListResult> {
    return this.service.list();
  }

  async getById(req: Request, _res: Response, _next: NextFunction): Promise<RoleResult> {
    return this.service.getById(req.params.id as string);
  }

  async create(req: Request, _res: Response, _next: NextFunction): Promise<RoleResult> {
    const dto = new CreateRoleDto(
      req.body.name,
      req.body.description,
      req.body.permissionIds ?? [],
    );

    return this.service.create(dto);
  }

  async updateMeta(req: Request, _res: Response, _next: NextFunction): Promise<RoleResult> {
    const dto = new UpdateRoleDto(req.body.name, req.body.description);

    return this.service.updateMeta(req.params.id as string, dto);
  }

  async setPermissions(req: Request, _res: Response, _next: NextFunction): Promise<RoleResult> {
    const dto = new SetRolePermissionsDto(req.body.permissionIds ?? []);

    return this.service.setPermissions(req.params.id as string, dto);
  }

  async delete(req: Request, _res: Response, _next: NextFunction): Promise<DeleteRoleResult> {
    return this.service.delete(req.params.id as string);
  }

  async assignToUser(req: Request, _res: Response, _next: NextFunction): Promise<AssignRoleResult> {
    const dto = new AssignRoleDto(req.params.userId as string, req.body.roleId);

    return this.service.assignToUser(dto);
  }

  async removeFromUser(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<AssignRoleResult> {
    const dto = new AssignRoleDto(req.params.userId as string, req.params.roleId as string);

    return this.service.removeFromUser(dto);
  }
}
