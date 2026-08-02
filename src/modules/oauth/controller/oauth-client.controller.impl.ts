import type { NextFunction, Request, Response } from 'express';
import { CreateOAuthClientDto } from '../dto/create-oauth-client.dto.js';
import type { IOAuthClientService } from '../service/interface/oauth-client.service.interface.js';
import type {
  OAuthClientCreatedResult,
  OAuthClientListResult,
  RegenerateClientSecretResult,
  RevokeOAuthClientResult,
} from '../types/oauth-client.types.js';
import type { IOAuthClientController } from './interface/oauth-client.controller.interface.js';

export class OAuthClientController implements IOAuthClientController {
  constructor(private readonly service: IOAuthClientService) {}

  async list(req: Request, _res: Response, _next: NextFunction): Promise<OAuthClientListResult> {
    return this.service.list(req.params.appId as string, req.tenantId);
  }

  async create(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<OAuthClientCreatedResult> {
    const dto = new CreateOAuthClientDto(
      req.body.name,
      req.body.redirectUris,
      req.body.clientType,
      req.body.grantTypes,
      req.body.scopes,
    );

    return this.service.create(
      req.params.appId as string,
      dto,
      req.tenantId,
      req.user?._id?.toString(),
    );
  }

  async regenerateSecret(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<RegenerateClientSecretResult> {
    return this.service.regenerateSecret(
      req.params.appId as string,
      req.params.clientId as string,
      req.tenantId,
      req.user?._id?.toString(),
    );
  }

  async revoke(
    req: Request,
    _res: Response,
    _next: NextFunction,
  ): Promise<RevokeOAuthClientResult> {
    return this.service.revoke(
      req.params.appId as string,
      req.params.clientId as string,
      req.tenantId,
      req.user?._id?.toString(),
    );
  }
}
