import type { NextFunction, Request, Response } from 'express';
import type {
  OAuthClientCreatedResult,
  OAuthClientListResult,
  RegenerateClientSecretResult,
  RevokeOAuthClientResult,
} from '../../types/oauth-client.types.js';

export interface IOAuthClientController {
  list(req: Request, res: Response, next: NextFunction): Promise<OAuthClientListResult>;

  create(req: Request, res: Response, next: NextFunction): Promise<OAuthClientCreatedResult>;

  regenerateSecret(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<RegenerateClientSecretResult>;

  revoke(req: Request, res: Response, next: NextFunction): Promise<RevokeOAuthClientResult>;
}
