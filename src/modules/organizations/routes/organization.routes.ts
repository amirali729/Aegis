import { Router } from 'express';

import { auditService } from '../../audit/routes/audit.routes.js';
import { AuthRepository } from '../../auth/repository/auth.repository.impl.js';
import { MembershipRepository } from '../../membership/repository/membership.repository.impl.js';
import { PermissionRepository } from '../../permission/repository/permission.repository.impl.js';
import { RoleRepository } from '../../role/repository/role.repository.impl.js';
import { OrganizationController } from '../controller/organization.controller.impl.js';
import { mapOrganizationError } from '../http/map-organization-error.js';
import { OrganizationRepository } from '../repository/organization.repository.impl.js';
import { OrganizationService } from '../service/organization.service.impl.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { validate } from '../../../shared/http/validate.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { resolveTenant } from '../../../shared/security/middleware/resolveTenant.middleware.js';
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

const organizationRepository = new OrganizationRepository();
const roleRepository = new RoleRepository();
const permissionRepository = new PermissionRepository();
const membershipRepository = new MembershipRepository();
const authRepository = new AuthRepository();

const organizationService = new OrganizationService(
  organizationRepository,
  roleRepository,
  permissionRepository,
  membershipRepository,
  authRepository,
  auditService,
);
const organizationController = new OrganizationController(organizationService);

router.use(verifyjwt, resolveTenant);

// Listing every organization in the system is a platform-operator
// action (requires a GLOBAL organization:view permission - see
// permission-evaluator.ts) rather than something an ordinary org owner
// can do; there's no "list just my organizations" endpoint yet.
router.get(
  ORGANIZATION_LIST,
  requirePermission('organization:view'),
  handle(organizationController.list.bind(organizationController), mapOrganizationError),
);

router.get(
  ORGANIZATION_GET_BY_ID,
  requirePermission('organization:view'),
  validate({ params: objectIdParamSchema('id') }),
  handle(organizationController.getById.bind(organizationController), mapOrganizationError),
);

// Deliberately just verifyjwt, no permission gate: any authenticated
// user may create an Organization and becomes its owner automatically
// (see OrganizationService.provisionOwner). Requiring
// organization:create here would be a deadlock - the default signup
// role has no permissions, so nobody could ever create their first org.
router.post(
  ORGANIZATION_CREATE,
  validate({ body: createOrganizationSchema }),
  handle(
    organizationController.create.bind(organizationController),
    mapOrganizationError,
    HttpStatus.CREATED,
  ),
);

router.patch(
  ORGANIZATION_UPDATE,
  requirePermission('organization:update'),
  validate({
    params: objectIdParamSchema('id'),
    body: updateOrganizationSchema,
  }),
  handle(organizationController.update.bind(organizationController), mapOrganizationError),
);

router.delete(
  ORGANIZATION_DELETE,
  requirePermission('organization:delete'),
  validate({ params: objectIdParamSchema('id') }),
  handle(organizationController.delete.bind(organizationController), mapOrganizationError),
);

export default router;
