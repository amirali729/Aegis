import { Router } from 'express';

import {
  OAUTH_DISCOVERY,
  OAUTH_JWKS,
  OAUTH_USERINFO,
} from '../../../shared/api-endpoint/oauth.api.endpoint.js';
import {
  createUserInfoHandler,
  discoveryHandler,
  jwksHandler,
} from '../controller/discovery.controller.impl.js';
import { AuthorizationCodeRepository } from '../repository/authorization-code.repository.impl.js';
import { OAuthAccessTokenRepository } from '../repository/oauth-access-token.repository.impl.js';
import { OAuthClientRepository } from '../repository/oauth-client.repository.impl.js';
import { OAuthRefreshTokenRepository } from '../repository/oauth-refresh-token.repository.impl.js';
import { OAuthTokenService } from '../service/oauth-token.service.impl.js';

const router = Router();

// Reuses the exact same OAuthTokenService as token.routes.ts - only
// getUserInfo() is exercised here, but the service is cheap to
// construct and this keeps every token-shaped lookup going through one
// implementation rather than duplicating access-token verification
// logic in a second place.
const tokenService = new OAuthTokenService(
  new OAuthClientRepository(),
  new AuthorizationCodeRepository(),
  new OAuthAccessTokenRepository(),
  new OAuthRefreshTokenRepository(),
);

// Standard, unauthenticated discovery endpoints - no verifyjwt, no
// client auth. Per spec, these must be publicly fetchable by anyone
// implementing an OIDC client against Aegis.
router.get(OAUTH_DISCOVERY, discoveryHandler);
router.get(OAUTH_JWKS, jwksHandler);

// Bearer-token authenticated (the access token itself is the
// credential - see createUserInfoHandler), not a login-session route.
router.get(OAUTH_USERINFO, createUserInfoHandler(tokenService));

export default router;
