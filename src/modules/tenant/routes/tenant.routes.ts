import { Router } from 'express';

import { TenantController } from '../controller/tenant.controller.impl.js';
import { mapTenantError } from '../http/map-tenant-error.js';
import { TenantRepository } from '../repository/tenant.repository.impl.js';
import { TenantService } from '../service/tenant.service.impl.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { validate } from '../../../shared/http/validate.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';
import { objectIdParamSchema } from '../../../shared/validation/object-id.schema.js';

import { createTenantSchema, updateTenantSchema } from '../validation/tenant.schemas.js';

import {
  TENANT_CREATE,
  TENANT_DELETE,
  TENANT_GET_BY_ID,
  TENANT_LIST,
  TENANT_UPDATE,
} from '../../../shared/api-endpoint/tenant.api.endpoint.js';

const router = Router();

const tenantRepository = new TenantRepository();
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService);

router.get(
  TENANT_LIST,
  verifyjwt,
  requirePermission('tenant:view'),
  handle(tenantController.list.bind(tenantController), mapTenantError),
);

router.get(
  TENANT_GET_BY_ID,
  verifyjwt,
  requirePermission('tenant:view'),
  validate({ params: objectIdParamSchema('id') }),
  handle(tenantController.getById.bind(tenantController), mapTenantError),
);

router.post(
  TENANT_CREATE,
  verifyjwt,
  requirePermission('tenant:create'),
  validate({ body: createTenantSchema }),
  handle(tenantController.create.bind(tenantController), mapTenantError, HttpStatus.CREATED),
);

router.patch(
  TENANT_UPDATE,
  verifyjwt,
  requirePermission('tenant:update'),
  validate({
    params: objectIdParamSchema('id'),
    body: updateTenantSchema,
  }),
  handle(tenantController.update.bind(tenantController), mapTenantError),
);

router.delete(
  TENANT_DELETE,
  verifyjwt,
  requirePermission('tenant:delete'),
  validate({ params: objectIdParamSchema('id') }),
  handle(tenantController.delete.bind(tenantController), mapTenantError),
);

export default router;
