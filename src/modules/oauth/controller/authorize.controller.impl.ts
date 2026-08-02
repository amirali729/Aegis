import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import type { JwtPayloadWithId } from '../../../shared/types/jwtPayload.js';
import { mapAuthorizeError } from '../http/map-authorize-error.js';
import type { IAuthorizeService } from '../service/interface/authorize.service.interface.js';

/**
 * Reads the access token the same way verifyjwt does (cookie, then
 * Authorization header) but never responds 401 on a missing/invalid
 * token - /oauth/authorize's contract for "not logged in" is a redirect
 * to the login page, not a JSON error (see AuthorizeService.authorize,
 * the 'require_login' outcome).
 */
function getOptionalUserId(req: Request): string | undefined {
  const token =
    req.cookies?.accessToken?.replace('Bearer ', '') ??
    (typeof req.headers.authorization === 'string'
      ? req.headers.authorization.replace('Bearer ', '')
      : undefined);

  if (!token) return undefined;

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
    ) as JwtPayloadWithId;
    return decoded._id;
  } catch {
    return undefined;
  }
}

export function createAuthorizeHandler(service: IAuthorizeService) {
  return async (req: Request, res: Response, _next: NextFunction) => {
    // req.query has already been validated + coerced against
    // authorizeQuerySchema by the validate() middleware in the route
    // definition, so this cast is safe.
    const query = req.query as unknown as Parameters<IAuthorizeService['authorize']>[0];
    const currentUserId = getOptionalUserId(req);
    const originalRequestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const result = await service.authorize(query, currentUserId, originalRequestUrl);

    if (!result.ok) {
      // Only reached for InvalidClientError/ValidationError/
      // InfrastructureError - see authorize.types.ts for why these
      // specifically are never redirected.
      return mapAuthorizeError(result.error).send(res);
    }

    if (result.value.type === 'require_login') {
      return res.redirect(result.value.loginUrl);
    }

    if (result.value.type === 'consent_required') {
      return res.redirect(result.value.consentUrl);
    }

    return res.redirect(result.value.url);
  };
}

/**
 * POST /oauth/consent/decision - called by the frontend's consent page
 * (not a browser top-level navigation like /oauth/authorize, so this is
 * a normal JSON API call: it returns a { redirect_url } for the frontend
 * to navigate to itself, rather than issuing an HTTP redirect directly).
 * Requires a real login session - unlike /oauth/authorize, which
 * redirects to login when unauthenticated, there's no sensible
 * "redirect to login" behavior for an API call the frontend only makes
 * once the user is already on the (login-gated) consent page.
 */
export function createConsentDecisionHandler(service: IAuthorizeService) {
  return async (req: Request, res: Response, _next: NextFunction) => {
    const currentUserId = getOptionalUserId(req);

    if (!currentUserId) {
      return res
        .status(401)
        .json({ error: 'invalid_request', error_description: 'Login required.' });
    }

    // req.body has already been validated against consentDecisionSchema.
    const { approved, ...query } = req.body as Parameters<IAuthorizeService['authorize']>[0] & {
      approved: boolean;
    };

    const result = await service.decideConsent(query, approved, currentUserId);

    if (!result.ok) {
      return mapAuthorizeError(result.error).send(res);
    }

    const redirectUrl =
      result.value.type === 'require_login'
        ? result.value.loginUrl
        : result.value.type === 'consent_required'
          ? result.value.consentUrl
          : result.value.url;

    return res.status(200).json({ redirect_url: redirectUrl });
  };
}
