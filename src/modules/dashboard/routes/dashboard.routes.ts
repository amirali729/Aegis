import { Router } from 'express';

import { ApiKeyRepository } from '../../apikey/repository/apikey.repository.impl.js';
import { ApplicationRepository } from '../../application/repository/application.repository.impl.js';
import { AuditLogRepository } from '../../audit/repository/audit-log.repository.impl.js';
import { AuthRepository } from '../../auth/repository/auth.repository.impl.js';
import { MembershipRepository } from '../../membership/repository/membership.repository.impl.js';
import { OrganizationRepository } from '../../organizations/repository/organization.repository.impl.js';
import { RoleRepository } from '../../role/repository/role.repository.impl.js';
import { SessionRepository } from '../../session/repository/session.repository.impl.js';
import { SessionService } from '../../session/service/session.service.impl.js';
import { WebhookRepository } from '../../webhook/repository/webhook.repository.impl.js';

import { DashboardController } from '../controller/dashboard.controller.impl.js';
import { mapDashboardError } from '../http/map-dashboard-error.js';
import { DashboardService } from '../service/dashboard.service.impl.js';

import { handle } from '../../../shared/http/handle.js';
import { validate } from '../../../shared/http/validate.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { resolveTenant } from '../../../shared/security/middleware/resolveTenant.middleware.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';

import { recentActivityQuerySchema } from '../validation/dashboard.schemas.js';

import {
  DASHBOARD_ACTIVITY,
  DASHBOARD_OVERVIEW,
  DASHBOARD_RECENT_ACTIVITY,
  DASHBOARD_RESOURCES,
  DASHBOARD_SECURITY,
  DASHBOARD_SYSTEM_HEALTH,
} from '../../../shared/api-endpoint/dashboard.api.endpoint.js';

const router = Router();

const authRepository = new AuthRepository();
const membershipRepository = new MembershipRepository();
const organizationRepository = new OrganizationRepository();
const applicationRepository = new ApplicationRepository();
const apiKeyRepository = new ApiKeyRepository();
const roleRepository = new RoleRepository();
const webhookRepository = new WebhookRepository();
const sessionRepository = new SessionRepository();
const sessionService = new SessionService(sessionRepository);
const auditLogRepository = new AuditLogRepository();

const dashboardService = new DashboardService(
  authRepository,
  membershipRepository,
  organizationRepository,
  applicationRepository,
  apiKeyRepository,
  roleRepository,
  webhookRepository,
  sessionService,
  auditLogRepository,
);
const dashboardController = new DashboardController(dashboardService);

// Every widget here reflects only what the caller is already entitled
// to see (their own account, sessions, and - when a tenant is resolved
// via X-Tenant-ID - the organization they belong to), so none of these
// need a permission gate beyond authentication, same as GET /auth/me.
router.use(verifyjwt, resolveTenant);

router.get(
  DASHBOARD_OVERVIEW,
  handle(dashboardController.overview.bind(dashboardController), mapDashboardError),
);

router.get(
  DASHBOARD_ACTIVITY,
  handle(dashboardController.activity.bind(dashboardController), mapDashboardError),
);

router.get(
  DASHBOARD_SECURITY,
  handle(dashboardController.security.bind(dashboardController), mapDashboardError),
);

router.get(
  DASHBOARD_RESOURCES,
  handle(dashboardController.resources.bind(dashboardController), mapDashboardError),
);

router.get(
  DASHBOARD_RECENT_ACTIVITY,
  validate({ query: recentActivityQuerySchema }),
  handle(dashboardController.recentActivity.bind(dashboardController), mapDashboardError),
);

// Exposes process/DB internals (uptime, memory, environment) - gated
// behind the same 'audit:view' permission the Audit module uses for
// its own sensitive, operator-facing endpoint, rather than introducing
// a brand new permission key just for this one widget.
router.get(
  DASHBOARD_SYSTEM_HEALTH,
  requirePermission('audit:view'),
  handle(dashboardController.systemHealth.bind(dashboardController), mapDashboardError),
);

export default router;
