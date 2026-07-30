import { Router } from 'express';

import { auditService } from '../../audit/routes/audit.routes.js';
import { PermissionController } from '../controller/permission.controller.impl.js';
import { mapPermissionError } from '../http/map-permission-error.js';
import { PermissionRepository } from '../repository/permission.repository.impl.js';
import { PermissionService } from '../service/permission.service.impl.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { validate } from '../../../shared/http/validate.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { resolveTenant } from '../../../shared/security/middleware/resolveTenant.middleware.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';
import { objectIdParamSchema } from '../../../shared/validation/object-id.schema.js';

import {
  createPermissionSchema,
  updatePermissionSchema,
} from '../validation/permission.schemas.js';

import {
  PERMISSION_CREATE,
  PERMISSION_DELETE,
  PERMISSION_GET_BY_ID,
  PERMISSION_LIST,
  PERMISSION_UPDATE,
} from '../../../shared/api-endpoint/permission.api.endpoint.js';

const router = Router();

const permissionRepository = new PermissionRepository();
const permissionService = new PermissionService(permissionRepository, auditService);
const permissionController = new PermissionController(permissionService);

router.use(verifyjwt, resolveTenant);

router.get(
  PERMISSION_LIST,
  requirePermission('permission:view'),
  handle(permissionController.list.bind(permissionController), mapPermissionError),
);

router.get(
  PERMISSION_GET_BY_ID,
  requirePermission('permission:view'),
  validate({ params: objectIdParamSchema('id') }),
  handle(permissionController.getById.bind(permissionController), mapPermissionError),
);

router.post(
  PERMISSION_CREATE,
  requirePermission('permission:create'),
  validate({ body: createPermissionSchema }),
  handle(
    permissionController.create.bind(permissionController),
    mapPermissionError,
    HttpStatus.CREATED,
  ),
);

router.patch(
  PERMISSION_UPDATE,
  requirePermission('permission:update'),
  validate({
    params: objectIdParamSchema('id'),
    body: updatePermissionSchema,
  }),
  handle(permissionController.update.bind(permissionController), mapPermissionError),
);

router.delete(
  PERMISSION_DELETE,
  requirePermission('permission:delete'),
  validate({ params: objectIdParamSchema('id') }),
  handle(permissionController.delete.bind(permissionController), mapPermissionError),
);

export default router;
