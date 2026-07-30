import { Router } from 'express';

import { OrganizationController } from '../controller/organization.controller.impl.js';
import { mapTenantError } from '../http/map-organization-error.js';
import { OrgnizationRepository } from '../repository/organization.repository.impl.js';
import { OrganizationService } from '../service/organization.service.impl.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { validate } from '../../../shared/http/validate.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';
import { objectIdParamSchema } from '../../../shared/validation/object-id.schema.js';

import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from '../validation/organization.schemas.js';

import {
  ORGANIZATION_CREATE,
  ORGANIZATION_DELETE,
  ORGANIZATION_GET_BY_ID,
  ORGANIZATION_LIST,
  ORGANIZATION_UPDATE,
} from '../../../shared/api-endpoint/organization.api.endpoint.js';

const router = Router();

const organizationRepository = new OrgnizationRepository();
const organizationService = new OrganizationService(organizationRepository);
const tenantController = new OrganizationController(organizationService);

router.get(
  ORGANIZATION_LIST,
  verifyjwt,
  requirePermission('organization:view'),
  handle(tenantController.list.bind(tenantController), mapTenantError),
);

router.get(
  ORGANIZATION_GET_BY_ID,
  verifyjwt,
  requirePermission('organization:view'),
  validate({ params: objectIdParamSchema('id') }),
  handle(tenantController.getById.bind(tenantController), mapTenantError),
);

router.post(
  ORGANIZATION_CREATE,
  verifyjwt,
  requirePermission('organization:create'),
  validate({ body: createOrganizationSchema }),
  handle(tenantController.create.bind(tenantController), mapTenantError, HttpStatus.CREATED),
);

router.patch(
  ORGANIZATION_UPDATE,
  verifyjwt,
  requirePermission('organization:update'),
  validate({
    params: objectIdParamSchema('id'),
    body: updateOrganizationSchema,
  }),
  handle(tenantController.update.bind(tenantController), mapTenantError),
);

router.delete(
  ORGANIZATION_DELETE,
  verifyjwt,
  requirePermission('tenant:delete'),
  validate({ params: objectIdParamSchema('id') }),
  handle(tenantController.delete.bind(tenantController), mapTenantError),
);

export default router;
