import { Router } from 'express';

import { auditService } from '../../audit/routes/audit.routes.js';
import { OrganizationRepository } from '../../organizations/repository/organization.repository.impl.js';
import { MembershipController } from '../controller/membership.controller.impl.js';
import { mapMembershipError } from '../http/map-membership-error.js';
import { MembershipRepository } from '../repository/membership.repository.impl.js';
import { MembershipService } from '../service/membership.service.impl.js';

import { handle } from '../../../shared/http/handle.js';
import { validate } from '../../../shared/http/validate.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { resolveTenant } from '../../../shared/security/middleware/resolveTenant.middleware.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';

import { orgAndUserIdParamSchema, orgIdParamSchema } from '../validation/membership.schemas.js';

import {
  MEMBER_LIST,
  MEMBER_REACTIVATE,
  MEMBER_REMOVE,
  MEMBER_SUSPEND,
} from '../../../shared/api-endpoint/membership.api.endpoint.js';

const router = Router();

const membershipRepository = new MembershipRepository();
const organizationRepository = new OrganizationRepository();
const membershipService = new MembershipService(
  membershipRepository,
  organizationRepository,
  auditService,
);
const membershipController = new MembershipController(membershipService);

router.use(verifyjwt, resolveTenant);

router.get(
  MEMBER_LIST,
  requirePermission('member:view'),
  validate({ params: orgIdParamSchema }),
  handle(membershipController.list.bind(membershipController), mapMembershipError),
);

router.patch(
  MEMBER_SUSPEND,
  requirePermission('member:remove'),
  validate({ params: orgAndUserIdParamSchema }),
  handle(membershipController.suspend.bind(membershipController), mapMembershipError),
);

router.patch(
  MEMBER_REACTIVATE,
  requirePermission('member:remove'),
  validate({ params: orgAndUserIdParamSchema }),
  handle(membershipController.reactivate.bind(membershipController), mapMembershipError),
);

router.delete(
  MEMBER_REMOVE,
  requirePermission('member:remove'),
  validate({ params: orgAndUserIdParamSchema }),
  handle(membershipController.remove.bind(membershipController), mapMembershipError),
);

export default router;
