import { Router } from 'express';

import { ApplicationRepository } from '../../application/repository/application.repository.impl.js';
import { auditService } from '../../audit/routes/audit.routes.js';
import { OAuthClientController } from '../controller/oauth-client.controller.impl.js';
import { mapOAuthClientError } from '../http/map-oauth-client-error.js';
import { OAuthClientRepository } from '../repository/oauth-client.repository.impl.js';
import { OAuthClientService } from '../service/oauth-client.service.impl.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { validate } from '../../../shared/http/validate.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { resolveTenant } from '../../../shared/security/middleware/resolveTenant.middleware.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';
import { objectIdParamSchema } from '../../../shared/validation/object-id.schema.js';

import { createOAuthClientSchema } from '../validation/oauth-client.schemas.js';

import {
  OAUTH_CLIENT_CREATE,
  OAUTH_CLIENT_LIST,
  OAUTH_CLIENT_REGENERATE_SECRET,
  OAUTH_CLIENT_REVOKE,
} from '../../../shared/api-endpoint/oauth-client.api.endpoint.js';

const router = Router();

const applicationRepository = new ApplicationRepository();
const oauthClientRepository = new OAuthClientRepository();

const oauthClientService = new OAuthClientService(
  oauthClientRepository,
  applicationRepository,
  auditService,
);

const oauthClientController = new OAuthClientController(oauthClientService);

// Every route here is authenticated + tenant-resolved first.
router.use(verifyjwt, resolveTenant);

router.get(
  OAUTH_CLIENT_LIST,
  requirePermission('oauth_client:view'),
  validate({ params: objectIdParamSchema('appId') }),
  handle(oauthClientController.list.bind(oauthClientController), mapOAuthClientError),
);

router.post(
  OAUTH_CLIENT_CREATE,
  requirePermission('oauth_client:create'),
  validate({
    params: objectIdParamSchema('appId'),
    body: createOAuthClientSchema,
  }),
  handle(
    oauthClientController.create.bind(oauthClientController),
    mapOAuthClientError,
    HttpStatus.CREATED,
  ),
);

router.post(
  OAUTH_CLIENT_REGENERATE_SECRET,
  requirePermission('oauth_client:update'),
  handle(oauthClientController.regenerateSecret.bind(oauthClientController), mapOAuthClientError),
);

router.delete(
  OAUTH_CLIENT_REVOKE,
  requirePermission('oauth_client:delete'),
  handle(oauthClientController.revoke.bind(oauthClientController), mapOAuthClientError),
);

export default router;
