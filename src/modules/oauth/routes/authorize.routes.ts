import { Router } from 'express';

import {
  OAUTH_AUTHORIZE,
  OAUTH_CONSENT_DECISION,
} from '../../../shared/api-endpoint/oauth.api.endpoint.js';
import { validate } from '../../../shared/http/validate.js';
import {
  createAuthorizeHandler,
  createConsentDecisionHandler,
} from '../controller/authorize.controller.impl.js';
import { AuthorizationCodeRepository } from '../repository/authorization-code.repository.impl.js';
import { OAuthClientRepository } from '../repository/oauth-client.repository.impl.js';
import { OAuthConsentRepository } from '../repository/oauth-consent.repository.impl.js';
import { AuthorizeService } from '../service/authorize.service.impl.js';
import { authorizeQuerySchema, consentDecisionSchema } from '../validation/authorize.schemas.js';

const router = Router();

const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';

const oauthClientRepository = new OAuthClientRepository();
const authorizationCodeRepository = new AuthorizationCodeRepository();
const oauthConsentRepository = new OAuthConsentRepository();
const authorizeService = new AuthorizeService(
  oauthClientRepository,
  authorizationCodeRepository,
  oauthConsentRepository,
  clientUrl,
);

// Deliberately NOT verifyjwt/resolveTenant - this is a browser-navigated
// endpoint whose contract is "redirect somewhere", not a JSON API call.
// Authentication is optional-and-checked inline (see
// authorize.controller.impl.ts, getOptionalUserId) so a missing/invalid
// token produces a redirect to the login page rather than a 401 JSON body.
router.get(
  OAUTH_AUTHORIZE,
  validate({ query: authorizeQuerySchema }),
  createAuthorizeHandler(authorizeService),
);

// Called by the frontend consent page (JSON API, not a browser
// navigation) after the user approves/denies - see
// createConsentDecisionHandler for why this requires a real login
// session rather than redirecting to one.
router.post(
  OAUTH_CONSENT_DECISION,
  validate({ body: consentDecisionSchema }),
  createConsentDecisionHandler(authorizeService),
);

export default router;
