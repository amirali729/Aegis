import { Router } from 'express';

// import { ApplicationRepository } from '../repository/application.repository.impl.js';
// import { ApiKeyRepository } from '../repository/api-key.repository.impl.js';
// import { ApplicationService } from '../service/application.service.impl.js';
// import { ApiKeyService } from '../service/api-key.service.impl.js';
// import { ApplicationController } from '../controller/application.controller.impl.js';
// import { ApiKeyController } from '../controller/api-key.controller.impl.js';
// import { mapApplicationError } from '../http/map-application-error.js';

// import { handle } from '../../../shared/http/handle.js';
// import { HttpStatus } from '../../../shared/http/http-status.js';
// import { validate } from '../../../shared/http/validate.js';
// import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';
// import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
// import { resolveTenant } from '../../../shared/security/middleware/resolveTenant.middleware.js';
// import { objectIdParamSchema } from '../../../shared/validation/object-id.schema.js';

// import {
//   createApplicationSchema,
//   updateApplicationSchema,
//   createApiKeySchema,
// } from '../validation/application.schemas.js';

// import {
//   APPLICATION_LIST,
//   APPLICATION_GET_BY_ID,
//   APPLICATION_CREATE,
//   APPLICATION_UPDATE,
//   APPLICATION_DELETE,
//   APPLICATION_REGENERATE_SECRET,
//   API_KEY_LIST,
//   API_KEY_CREATE,
//   API_KEY_REVOKE,
// } from '../../../shared/api-endpoint/application.api.endpoint.js';

import { ApiKeyRepository } from '../repository/apikey.repository.impl.js';
import { ApiKeyService } from '../service/api-key.service.impl.js';
import { ApiKeyController } from '../controller/api-key.controller.impl.js';
// import { mapApplicationError } from '../http/map-application-error.js';
import { apiKeyError } from '../http/map-api-key-error.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { validate } from '../../../shared/http/validate.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { resolveTenant } from '../../../shared/security/middleware/resolveTenant.middleware.js';
import { objectIdParamSchema } from '../../../shared/validation/object-id.schema.js';

import { createApiKeySchema } from '../validation/api-key.schemas.js';

import {
  API_KEY_LIST,
  API_KEY_CREATE,
  API_KEY_REVOKE,
} from '../../../shared/api-endpoint/api-key.api.endpoint.js';

const router = Router();

const apiKeyRepository = new ApiKeyRepository();

const apiKeyService = new ApiKeyService(apiKeyRepository, applicationRepository);

const apiKeyController = new ApiKeyController(apiKeyService);

// Every route here is authenticated + tenant-resolved first.
router.use(verifyjwt, resolveTenant);

router.get(
  API_KEY_LIST,
  requirePermission('apikey:view'),
  validate({ params: objectIdParamSchema('appId') }),
  handle(apiKeyController.list.bind(apiKeyController), apiKeyError),
);

router.post(
  API_KEY_CREATE,
  requirePermission('apikey:create'),
  validate({
    params: objectIdParamSchema('appId'),
    body: createApiKeySchema,
  }),
  handle(apiKeyController.create.bind(apiKeyController), apiKeyError, HttpStatus.CREATED),
);

router.delete(
  API_KEY_REVOKE,
  requirePermission('apikey:delete'),
  handle(apiKeyController.revoke.bind(apiKeyController), apiKeyError),
);

export default router;
