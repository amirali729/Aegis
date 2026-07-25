import { Router } from 'express';

import { RoleRepository } from '../repository/role.repository.impl.js';
import { UserRoleRepository } from '../repository/user-role.repository.impl.js';
import { PermissionRepository } from '../../permission/repository/permission.repository.impl.js';
import { RoleService } from '../service/role.service.impl.js';
import { RoleController } from '../controller/role.controller.impl.js';
import { mapRoleError } from '../http/map-role-error.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { validate } from '../../../shared/http/validate.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { objectIdParamSchema } from '../../../shared/validation/object-id.schema.js';

import {
  createRoleSchema,
  updateRoleSchema,
  setRolePermissionsSchema,
  assignRoleBodySchema,
  assignRoleParamsSchema,
  removeRoleParamsSchema,
} from '../validation/role.schemas.js';

import {
  ROLE_LIST,
  ROLE_GET_BY_ID,
  ROLE_CREATE,
  ROLE_UPDATE,
  ROLE_SET_PERMISSIONS,
  ROLE_DELETE,
  ROLE_ASSIGN_TO_USER,
  ROLE_REMOVE_FROM_USER,
} from '../../../shared/api-endpoint/role.api.endpoint.js';

const router = Router();

const roleRepository = new RoleRepository();
const permissionRepository = new PermissionRepository();
const userRoleRepository = new UserRoleRepository();

const roleService = new RoleService(roleRepository, permissionRepository, userRoleRepository);
const roleController = new RoleController(roleService);

router.get(
  ROLE_LIST,
  verifyjwt,
  requirePermission('role:view'),
  handle(roleController.list.bind(roleController), mapRoleError),
);

router.get(
  ROLE_GET_BY_ID,
  verifyjwt,
  requirePermission('role:view'),
  validate({ params: objectIdParamSchema('id') }),
  handle(roleController.getById.bind(roleController), mapRoleError),
);

router.post(
  ROLE_CREATE,
  verifyjwt,
  requirePermission('role:create'),
  validate({ body: createRoleSchema }),
  handle(roleController.create.bind(roleController), mapRoleError, HttpStatus.CREATED),
);

router.patch(
  ROLE_UPDATE,
  verifyjwt,
  requirePermission('role:update'),
  validate({
    params: objectIdParamSchema('id'),
    body: updateRoleSchema,
  }),
  handle(roleController.updateMeta.bind(roleController), mapRoleError),
);

router.put(
  ROLE_SET_PERMISSIONS,
  verifyjwt,
  requirePermission('role:update'),
  validate({
    params: objectIdParamSchema('id'),
    body: setRolePermissionsSchema,
  }),
  handle(roleController.setPermissions.bind(roleController), mapRoleError),
);

router.delete(
  ROLE_DELETE,
  verifyjwt,
  requirePermission('role:delete'),
  validate({ params: objectIdParamSchema('id') }),
  handle(roleController.delete.bind(roleController), mapRoleError),
);

router.post(
  ROLE_ASSIGN_TO_USER,
  verifyjwt,
  requirePermission('role:update'),
  validate({
    params: assignRoleParamsSchema,
    body: assignRoleBodySchema,
  }),
  handle(roleController.assignToUser.bind(roleController), mapRoleError),
);

router.delete(
  ROLE_REMOVE_FROM_USER,
  verifyjwt,
  requirePermission('role:update'),
  validate({ params: removeRoleParamsSchema }),
  handle(roleController.removeFromUser.bind(roleController), mapRoleError),
);

export default router;
