import { Router } from 'express';

import { auditService } from '../../audit/routes/audit.routes.js';
import { AuthRepository } from '../../auth/repository/auth.repository.impl.js';
import { MembershipRepository } from '../../membership/repository/membership.repository.impl.js';
import { SessionRepository } from '../../session/repository/session.repository.impl.js';
import { SessionService } from '../../session/service/session.service.impl.js';
import { SettingsController } from '../controller/settings.controller.impl.js';
import { mapSettingsError } from '../http/map-settings-error.js';
import { SettingsRepository } from '../repository/settings.repository.impl.js';
import { SettingsService } from '../service/settings.service.impl.js';

import { handle } from '../../../shared/http/handle.js';
import { validate } from '../../../shared/http/validate.js';
import { sensitiveActionRateLimiter } from '../../../shared/security/middleware/rate-limit.middleware.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';

import {
  deleteAccountSchema,
  disconnectAppParamsSchema,
  updatePreferencesSchema,
  updateProfileSchema,
} from '../validation/settings.schemas.js';

import {
  SETTINGS_CONNECTED_APPS,
  SETTINGS_DEACTIVATE,
  SETTINGS_DELETE_ACCOUNT,
  SETTINGS_DISCONNECT_APP,
  SETTINGS_PREFERENCES,
  SETTINGS_PROFILE,
  SETTINGS_REACTIVATE,
} from '../../../shared/api-endpoint/settings.api.endpoint.js';

const router = Router();

const settingsRepository = new SettingsRepository();
const authRepository = new AuthRepository();
const sessionRepository = new SessionRepository();
const sessionService = new SessionService(sessionRepository);
const membershipRepository = new MembershipRepository();

const settingsService = new SettingsService(
  settingsRepository,
  authRepository,
  sessionService,
  membershipRepository,
  auditService,
);
const settingsController = new SettingsController(settingsService);

// Every route here acts on the caller's own account/settings - there's
// no :userId param and no permission gate beyond being authenticated,
// same pattern as GET /auth/me.
router.use(verifyjwt);

router.get(
  SETTINGS_PROFILE,
  handle(settingsController.getProfile.bind(settingsController), mapSettingsError),
);

router.patch(
  SETTINGS_PROFILE,
  validate({ body: updateProfileSchema }),
  handle(settingsController.updateProfile.bind(settingsController), mapSettingsError),
);

router.get(
  SETTINGS_PREFERENCES,
  handle(settingsController.getPreferences.bind(settingsController), mapSettingsError),
);

router.patch(
  SETTINGS_PREFERENCES,
  validate({ body: updatePreferencesSchema }),
  handle(settingsController.updatePreferences.bind(settingsController), mapSettingsError),
);

router.get(
  SETTINGS_CONNECTED_APPS,
  handle(settingsController.listConnectedApps.bind(settingsController), mapSettingsError),
);

router.delete(
  SETTINGS_DISCONNECT_APP,
  validate({ params: disconnectAppParamsSchema }),
  handle(settingsController.disconnectApp.bind(settingsController), mapSettingsError),
);

router.post(
  SETTINGS_DEACTIVATE,
  sensitiveActionRateLimiter,
  handle(settingsController.deactivateAccount.bind(settingsController), mapSettingsError),
);

router.post(
  SETTINGS_REACTIVATE,
  handle(settingsController.reactivateAccount.bind(settingsController), mapSettingsError),
);

router.delete(
  SETTINGS_DELETE_ACCOUNT,
  sensitiveActionRateLimiter,
  validate({ body: deleteAccountSchema }),
  handle(settingsController.deleteAccount.bind(settingsController), mapSettingsError),
);

export default router;
