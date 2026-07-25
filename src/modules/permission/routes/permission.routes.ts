import { Router } from 'express';

import { PermissionRepository } from '../repository/permission.repository.impl.js';
import { PermissionService } from '../service/permission.service.impl.js';
import { PermissionController } from '../controller/permission.controller.impl.js';
import { mapPermissionError } from '../http/map-permission-error.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { validate } from '../../../shared/http/validate.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { objectIdParamSchema } from '../../../shared/validation/object-id.schema.js';

import {
  createPermissionSchema,
  updatePermissionSchema,
} from '../validation/permission.schemas.js';

import {
  PERMISSION_LIST,
  PERMISSION_GET_BY_ID,
  PERMISSION_CREATE,
  PERMISSION_UPDATE,
  PERMISSION_DELETE,
} from '../../../shared/api-endpoint/permission.api.endpoint.js';

const router = Router();

const permissionRepository = new PermissionRepository();
const permissionService = new PermissionService(permissionRepository);
const permissionController = new PermissionController(permissionService);

router.get(
  PERMISSION_LIST,
  verifyjwt,
  requirePermission('permission:view'),
  handle(permissionController.list.bind(permissionController), mapPermissionError),
);

router.get(
  PERMISSION_GET_BY_ID,
  verifyjwt,
  requirePermission('permission:view'),
  validate({ params: objectIdParamSchema('id') }),
  handle(permissionController.getById.bind(permissionController), mapPermissionError),
);

router.post(
  PERMISSION_CREATE,
  verifyjwt,
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
  verifyjwt,
  requirePermission('permission:update'),
  validate({
    params: objectIdParamSchema('id'),
    body: updatePermissionSchema,
  }),
  handle(permissionController.update.bind(permissionController), mapPermissionError),
);

router.delete(
  PERMISSION_DELETE,
  verifyjwt,
  requirePermission('permission:delete'),
  validate({ params: objectIdParamSchema('id') }),
  handle(permissionController.delete.bind(permissionController), mapPermissionError),
);

export default router;
