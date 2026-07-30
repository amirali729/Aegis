import { Router } from 'express';

import { mapInvitationError } from '../http/map-invitation-error.js';
import { invitationController } from './invitation.routes.js';

import { handle } from '../../../shared/http/handle.js';
import { validate } from '../../../shared/http/validate.js';
import { sensitiveActionRateLimiter } from '../../../shared/security/middleware/rate-limit.middleware.js';

import { INVITATION_ACCEPT } from '../../../shared/api-endpoint/invitation.api.endpoint.js';
import { acceptInvitationSchema } from '../validation/invitation.schemas.js';

const router = Router();

// Public: accepting an invite is how a not-yet-a-member proves they
// received the emailed link - there is nothing to authenticate against
// yet. Rate limited like other sensitive one-time-token endpoints
// (verify-email, reset-password) since it accepts a bare token.
//
// This lives in its own router, mounted BEFORE every other router in
// app.ts, specifically because several other routers apply verifyjwt
// via router.use() with no path filter - which matches every method
// and path under their mount point, not just their own defined routes.
// If this route were registered after any of those, it would never be
// reached: the earlier router's verifyjwt would intercept the request
// and respond 401 before Express ever tried this router.
router.post(
  INVITATION_ACCEPT,
  sensitiveActionRateLimiter,
  validate({ body: acceptInvitationSchema }),
  handle(invitationController.accept.bind(invitationController), mapInvitationError),
);

export default router;
