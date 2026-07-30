import { Router } from 'express';

import { auditService } from '../../audit/routes/audit.routes.js';
import { ApplicationRepository } from '../repository/application.repository.impl.js';
// import { ApiKeyRepository } from '../repository/api-key.repository.impl.js';
import { ApplicationService } from '../service/application.service.impl.js';
// import { ApiKeyService } from '../service/api-key.service.impl.js';
import { ApplicationController } from '../controller/application.controller.impl.js';
// import { ApiKeyController } from '../controller/api-key.controller.impl.js';
import { mapApplicationError } from '../http/map-application-error.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { validate } from '../../../shared/http/validate.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { resolveTenant } from '../../../shared/security/middleware/resolveTenant.middleware.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';
import { objectIdParamSchema } from '../../../shared/validation/object-id.schema.js';

import {
  createApplicationSchema,
  updateApplicationSchema,
} from '../validation/application.schemas.js';

import {
  APPLICATION_CREATE,
  APPLICATION_DELETE,
  APPLICATION_GET_BY_ID,
  APPLICATION_LIST,
  APPLICATION_REGENERATE_SECRET,
  APPLICATION_UPDATE,
} from '../../../shared/api-endpoint/application.api.endpoin.js';

const router = Router();

const applicationRepository = new ApplicationRepository();

const applicationService = new ApplicationService(applicationRepository, auditService);

const applicationController = new ApplicationController(applicationService);

// Every route here is authenticated + tenant-resolved first.
router.use(verifyjwt, resolveTenant);

router.get(
  APPLICATION_LIST,
  requirePermission('application:view'),
  handle(applicationController.list.bind(applicationController), mapApplicationError),
);

router.get(
  APPLICATION_GET_BY_ID,
  requirePermission('application:view'),
  validate({ params: objectIdParamSchema('id') }),
  handle(applicationController.getById.bind(applicationController), mapApplicationError),
);

router.post(
  APPLICATION_CREATE,
  requirePermission('application:create'),
  validate({ body: createApplicationSchema }),
  handle(
    applicationController.create.bind(applicationController),
    mapApplicationError,
    HttpStatus.CREATED,
  ),
);

router.patch(
  APPLICATION_UPDATE,
  requirePermission('application:update'),
  validate({
    params: objectIdParamSchema('id'),
    body: updateApplicationSchema,
  }),
  handle(applicationController.update.bind(applicationController), mapApplicationError),
);

router.delete(
  APPLICATION_DELETE,
  requirePermission('application:delete'),
  validate({ params: objectIdParamSchema('id') }),
  handle(applicationController.delete.bind(applicationController), mapApplicationError),
);

router.post(
  APPLICATION_REGENERATE_SECRET,
  requirePermission('application:update'),
  validate({ params: objectIdParamSchema('id') }),
  handle(applicationController.regenerateSecret.bind(applicationController), mapApplicationError),
);

export default router;
