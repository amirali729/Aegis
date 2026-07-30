import { Router } from 'express';

import { ApplicationRepository } from '../../application/repository/application.repository.impl.js';
import { auditService } from '../../audit/routes/audit.routes.js';
import { ApiKeyController } from '../controller/api-key.controller.impl.js';
import { mapApplicationError } from '../http/map-api-key-error.js';
import { ApiKeyRepository } from '../repository/apikey.repository.impl.js';
import { ApiKeyService } from '../service/api-key.service.impl.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { validate } from '../../../shared/http/validate.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { resolveTenant } from '../../../shared/security/middleware/resolveTenant.middleware.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';
import { objectIdParamSchema } from '../../../shared/validation/object-id.schema.js';

import { createApiKeySchema } from '../validation/api-key.schemas.js';

import {
  API_KEY_CREATE,
  API_KEY_LIST,
  API_KEY_REVOKE,
} from '../../../shared/api-endpoint/api-key.api.endpoint.js';

const router = Router();

const applicationRepository = new ApplicationRepository();
const apiKeyRepository = new ApiKeyRepository();

const apiKeyService = new ApiKeyService(apiKeyRepository, applicationRepository, auditService);

const apiKeyController = new ApiKeyController(apiKeyService);

// Every route here is authenticated + tenant-resolved first.
router.use(verifyjwt, resolveTenant);

router.get(
  API_KEY_LIST,
  requirePermission('apikey:view'),
  validate({ params: objectIdParamSchema('appId') }),
  handle(apiKeyController.list.bind(apiKeyController), mapApplicationError),
);

router.post(
  API_KEY_CREATE,
  requirePermission('apikey:create'),
  validate({
    params: objectIdParamSchema('appId'),
    body: createApiKeySchema,
  }),
  handle(apiKeyController.create.bind(apiKeyController), mapApplicationError, HttpStatus.CREATED),
);

router.delete(
  API_KEY_REVOKE,
  requirePermission('apikey:delete'),
  handle(apiKeyController.revoke.bind(apiKeyController), mapApplicationError),
);

export default router;
