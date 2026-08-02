import { Router } from 'express';

import {
  OAUTH_INTROSPECT,
  OAUTH_REVOKE,
  OAUTH_TOKEN,
} from '../../../shared/api-endpoint/oauth.api.endpoint.js';
import { auditService } from '../../audit/routes/audit.routes.js';
import {
  createIntrospectHandler,
  createRevokeHandler,
  createTokenHandler,
} from '../controller/token.controller.impl.js';
import { AuthorizationCodeRepository } from '../repository/authorization-code.repository.impl.js';
import { OAuthAccessTokenRepository } from '../repository/oauth-access-token.repository.impl.js';
import { OAuthClientRepository } from '../repository/oauth-client.repository.impl.js';
import { OAuthRefreshTokenRepository } from '../repository/oauth-refresh-token.repository.impl.js';
import { OAuthTokenService } from '../service/oauth-token.service.impl.js';

const router = Router();

const clientRepository = new OAuthClientRepository();
const codeRepository = new AuthorizationCodeRepository();
const accessTokenRepository = new OAuthAccessTokenRepository();
const refreshTokenRepository = new OAuthRefreshTokenRepository();

const tokenService = new OAuthTokenService(
  clientRepository,
  codeRepository,
  accessTokenRepository,
  refreshTokenRepository,
  auditService,
);

// Deliberately NOT verifyjwt, and deliberately NOT the shared validate()
// middleware either - the caller here is the OAuth CLIENT (authenticating
// itself via client_id/client_secret in the request body, checked inside
// OAuthTokenService), not an Aegis end user with a login session, and
// every response (including validation failures) must be RFC 6749/7009/
// 7662-shaped, not this app's internal envelope. Request parsing happens
// inside each handler via parse-oauth-request.ts instead - see
// controller/token.controller.impl.ts for why.
router.post(OAUTH_TOKEN, createTokenHandler(tokenService));
router.post(OAUTH_REVOKE, createRevokeHandler(tokenService));
router.post(OAUTH_INTROSPECT, createIntrospectHandler(tokenService));

export default router;
