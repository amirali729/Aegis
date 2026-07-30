import type { NextFunction, Request, Response } from 'express';
import { CreateApplicationDto } from '../dto/create-application.dto.js';
import { UpdateApplicationDto } from '../dto/update-application.dto.js';
import type { IApplicationService } from '../service/interface/application.service.interface.js';
import type {
  ApplicationCreatedResult,
  ApplicationListResult,
  ApplicationResult,
  DeleteApplicationResult,
  RegenerateSecretResult,
} from '../types/application.types.js';
import type { IApplicationController } from './interface/application.controller.interface.js';

export class ApplicationController implements IApplicationController {
  constructor(private readonly service: IApplicationService) {}

  async list(req: Request, _res: Response, _next: NextFunction): Promise<ApplicationListResult> {
    return this.service.list(req.tenantId);
  }

  async getById(req: Request, _res: Response, _next: NextFunction): Promise<ApplicationResult> {
    return this.service.getById(req.params.id as string, req.tenantId);
  }

  async create(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<ApplicationCreatedResult> {
    const dto = new CreateApplicationDto(
      req.body.name,
      req.body.allowedOrigins ?? [],
      req.body.redirectUris ?? [],
      req.body.accessTokenTTL ?? '15m',
      req.body.refreshTokenTTL ?? '7d',
    );

    return this.service.create(dto, req.tenantId, req.user?._id?.toString());
  }

  async update(req: Request, _res: Response, _next: NextFunction): Promise<ApplicationResult> {
    const dto = new UpdateApplicationDto(
      req.body.name,
      req.body.allowedOrigins,
      req.body.redirectUris,
      req.body.accessTokenTTL,
      req.body.refreshTokenTTL,
      req.body.isActive,
    );

    return this.service.update(req.params.id as string, dto, req.tenantId);
  }

  async delete(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<DeleteApplicationResult> {
    return this.service.delete(req.params.id as string, req.tenantId);
  }

  async regenerateSecret(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<RegenerateSecretResult> {
    return this.service.regenerateSecret(req.params.id as string, req.tenantId);
  }
}
