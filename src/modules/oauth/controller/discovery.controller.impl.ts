import type { NextFunction, Request, Response } from 'express';
import { getOidcJwks } from '../security/oidc-keys.js';
import { buildDiscoveryDocument } from '../service/discovery-document.js';
import type { IOAuthTokenService } from '../service/interface/oauth-token.service.interface.js';

const OIDC_ISSUER = process.env.OAUTH_ISSUER ?? 'http://localhost:3000';

export function discoveryHandler(_req: Request, res: Response) {
  return res.status(200).json(buildDiscoveryDocument(OIDC_ISSUER));
}

export function jwksHandler(_req: Request, res: Response) {
  return res.status(200).json({ keys: getOidcJwks() });
}

export function createUserInfoHandler(service: IOAuthTokenService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).set('WWW-Authenticate', 'Bearer').json({
          error: 'invalid_token',
          error_description: 'A Bearer access token is required.',
        });
      }

      const accessToken = authHeader.slice('Bearer '.length);
      const result = await service.getUserInfo(accessToken);

      if (!result.ok) {
        return res
          .status(result.error.httpStatus)
          .set('WWW-Authenticate', 'Bearer')
          .json({ error: 'invalid_token', error_description: result.error.message });
      }

      return res.status(200).json(result.value);
    } catch (error) {
      next(error);
    }
  };
}
