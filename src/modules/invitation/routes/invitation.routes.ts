import { Router } from 'express';

import { auditService } from '../../audit/routes/audit.routes.js';
import { AuthRepository } from '../../auth/repository/auth.repository.impl.js';
import { createMailer } from '../../email/mailer.facotry.js';
import { MembershipRepository } from '../../membership/repository/membership.repository.impl.js';
import { OrganizationRepository } from '../../organizations/repository/organization.repository.impl.js';
import { InvitationController } from '../controller/invitation.controller.impl.js';
import { mapInvitationError } from '../http/map-invitation-error.js';
import { InvitationRepository } from '../repository/invitation.repository.impl.js';
import { InvitationService } from '../service/invitation.service.impl.js';

import { handle } from '../../../shared/http/handle.js';
import { HttpStatus } from '../../../shared/http/http-status.js';
import { validate } from '../../../shared/http/validate.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { resolveTenant } from '../../../shared/security/middleware/resolveTenant.middleware.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';

import {
  inviteMemberSchema,
  orgAndInvitationIdParamSchema,
  orgIdParamSchema,
} from '../validation/invitation.schemas.js';

import {
  INVITATION_INVITE,
  INVITATION_LIST,
  INVITATION_REVOKE,
} from '../../../shared/api-endpoint/invitation.api.endpoint.js';

const router = Router();

const invitationRepository = new InvitationRepository();
const membershipRepository = new MembershipRepository();
const organizationRepository = new OrganizationRepository();
const authRepository = new AuthRepository();
const mailer = createMailer();
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';

const invitationService = new InvitationService(
  invitationRepository,
  membershipRepository,
  organizationRepository,
  authRepository,
  mailer,
  clientUrl,
  auditService,
);
// Exported so invitation-public.routes.ts (the accept endpoint, which
// must NOT sit behind this router's verifyjwt) can reuse the same
// controller/service instance instead of constructing a second one.
export const invitationController = new InvitationController(invitationService);

router.use(verifyjwt, resolveTenant);

router.post(
  INVITATION_INVITE,
  requirePermission('invitation:create'),
  validate({ params: orgIdParamSchema, body: inviteMemberSchema }),
  handle(
    invitationController.invite.bind(invitationController),
    mapInvitationError,
    HttpStatus.CREATED,
  ),
);

router.get(
  INVITATION_LIST,
  requirePermission('invitation:view'),
  validate({ params: orgIdParamSchema }),
  handle(invitationController.list.bind(invitationController), mapInvitationError),
);

router.delete(
  INVITATION_REVOKE,
  requirePermission('invitation:revoke'),
  validate({ params: orgAndInvitationIdParamSchema }),
  handle(invitationController.revoke.bind(invitationController), mapInvitationError),
);

export default router;
