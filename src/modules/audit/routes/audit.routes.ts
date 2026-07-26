import { Router } from 'express';

import { AuditController } from '../controller/audit.controller.impl.js';
import { mapAuditError } from '../http/map-audit-error.js';
import { AuditLogRepository } from '../repository/audit-log.repository.impl.js';
import { AuditService } from '../service/audit.service.impl.js';

import { handle } from '../../../shared/http/handle.js';
import { validate } from '../../../shared/http/validate.js';
import { requirePermission } from '../../../shared/security/middleware/requirePermission.middleware.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';

import { AUDIT_LOG_LIST } from '../../../shared/api-endpoint/audit.api.endpoint.js';
import { listAuditLogsQuerySchema } from '../validation/audit.schemas.js';

const router = Router();

const auditLogRepository = new AuditLogRepository();

// Exported so other modules' composition roots (auth.router.ts, etc.)
// can inject this same instance as their IAuditLogger dependency,
// instead of each module standing up its own AuditService.
export const auditService = new AuditService(auditLogRepository);

const auditController = new AuditController(auditService);

router.get(
  AUDIT_LOG_LIST,
  verifyjwt,
  requirePermission('audit:view'),
  validate({ query: listAuditLogsQuerySchema }),
  handle(auditController.list.bind(auditController), mapAuditError),
);

export default router;
