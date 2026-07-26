import type { Request, Response, NextFunction } from 'express';
import type {
  ApiKeyCreatedResult,
  ApiKeyListResult,
  RevokeApiKeyResult,
} from '../../types/api-key.types.js';

export interface IApiKeyController {
  list(req: Request, res: Response, next: NextFunction): Promise<ApiKeyListResult>;

  create(req: Request, res: Response, next: NextFunction): Promise<ApiKeyCreatedResult>;

  revoke(req: Request, res: Response, next: NextFunction): Promise<RevokeApiKeyResult>;
}
