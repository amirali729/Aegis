import type { Request, Response, NextFunction } from 'express';
import { ApiKeyRepository } from '../../../modules/apikey/repository/apikey.repository.impl.js';
import { ApplicationRepository } from '../../../modules/application/repository/application.repository.impl.js';
import { ApiKeyService } from '../../../modules/apikey/service/api-key.service.impl.js';

const apiKeyService = new ApiKeyService(new ApiKeyRepository(), new ApplicationRepository());

/**
 * Verifies the X-API-Key header against stored (hashed) API keys and
 * attaches the owning Application to req.application. Use this on
 * routes meant for server-to-server integrations rather than
 * end-user sessions (which use verifyjwt instead).
 */
export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const rawKey = req.headers['x-api-key'];

  if (typeof rawKey !== 'string' || !rawKey) {
    return res.status(401).json({ message: 'Missing X-API-Key header.' });
  }

  const result = await apiKeyService.verifyApiKey(rawKey);

  if (!result.ok) {
    return res.status(401).json({ message: result.error.message });
  }

  req.application = result.value;
  next();
}
