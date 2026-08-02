import type { NextFunction, Request, Response } from 'express';
import type { OAuthTokenError } from '../errors/oauth-token.error.js';
import type { IOAuthTokenService } from '../service/interface/oauth-token.service.interface.js';
import {
  parseIntrospectRequest,
  parseRevokeRequest,
  parseTokenRequest,
} from '../validation/parse-oauth-request.js';

function sendOAuthError(res: Response, error: OAuthTokenError) {
  return res.status(error.httpStatus).json({ error: error.code, error_description: error.message });
}

/**
 * These three handlers deliberately do NOT use the shared validate()
 * middleware (contrast with every other module's routes). validate()
 * always serializes failures through this codebase's internal
 * BaseErrorResponse envelope, which is the wrong shape for an OAuth
 * endpoint - third-party OAuth client libraries expect RFC 6749/7009/
 * 7662's { error, error_description } shape, including for malformed
 * requests, not just for requests that parsed successfully. Parsing
 * happens here instead, via parse-oauth-request.ts, so every failure
 * path - not just ones the service layer produces - stays spec-shaped.
 */

export function createTokenHandler(service: IOAuthTokenService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = parseTokenRequest(req.body);

      if (!parsed.ok) {
        return sendOAuthError(res, parsed.error);
      }

      const result = await service.exchange(parsed.value);

      if (!result.ok) {
        return sendOAuthError(res, result.error);
      }

      // RFC 6749 section 5.1 requires these two headers on a token response.
      res.set('Cache-Control', 'no-store');
      res.set('Pragma', 'no-cache');

      return res.status(200).json(result.value);
    } catch (error) {
      next(error);
    }
  };
}

export function createRevokeHandler(service: IOAuthTokenService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = parseRevokeRequest(req.body);

      if (!parsed.ok) {
        return sendOAuthError(res, parsed.error);
      }

      const { token, token_type_hint, client_id, client_secret } = parsed.value;
      const result = await service.revoke(token, token_type_hint, client_id, client_secret);

      if (!result.ok) {
        return sendOAuthError(res, result.error);
      }

      // RFC 7009 section 2.2 - a bare 200 with no body on success.
      return res.status(200).send();
    } catch (error) {
      next(error);
    }
  };
}

export function createIntrospectHandler(service: IOAuthTokenService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = parseIntrospectRequest(req.body);

      if (!parsed.ok) {
        return sendOAuthError(res, parsed.error);
      }

      const { token, token_type_hint, client_id, client_secret } = parsed.value;
      const result = await service.introspect(token, token_type_hint, client_id, client_secret);

      if (!result.ok) {
        return sendOAuthError(res, result.error);
      }

      return res.status(200).json(result.value);
    } catch (error) {
      next(error);
    }
  };
}
