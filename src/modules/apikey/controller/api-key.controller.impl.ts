import type { NextFunction, Request, Response } from 'express';
import { CreateApiKeyDto } from '../dto/create-api-key.dto.js';
import type { IApiKeyService } from '../service/interface/api-key.service.interface.js';
import type {
  ApiKeyCreatedResult,
  ApiKeyListResult,
  RevokeApiKeyResult,
} from '../types/api-key.types.js';
import type { IApiKeyController } from './interface/api-key.controller.interface.js';

export class ApiKeyController implements IApiKeyController {
  constructor(private readonly service: IApiKeyService) {}

  async list(req: Request, _res: Response, _next: NextFunction): Promise<ApiKeyListResult> {
    return this.service.list(req.params.appId as string, req.tenantId);
  }

  async create(req: Request, _res: Response, _next: NextFunction): Promise<ApiKeyCreatedResult> {
    const dto = new CreateApiKeyDto(req.body.name, req.body.expiresInDays);

    return this.service.create(
      req.params.appId as string,
      dto,
      req.tenantId,
      req.user?._id?.toString(),
    );
  }

  async revoke(req: Request, _res: Response, _next: NextFunction): Promise<RevokeApiKeyResult> {
    return this.service.revoke(
      req.params.appId as string,
      req.params.keyId as string,
      req.tenantId,
      req.user?._id?.toString(),
    );
  }
}
