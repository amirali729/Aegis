import { Router } from 'express';

import { SessionRepository } from '../repository/session.repository.impl.js';
import { SessionService } from '../service/session.service.impl.js';
import { SessionController } from '../controller/session.controller.impl.js';
import { mapSessionError } from '../http/map-session-error.js';

import { handle } from '../../../shared/http/handle.js';
import { validate } from '../../../shared/http/validate.js';
import { verifyjwt } from '../../../shared/security/middleware/verifyJwt.middleware.js';
import { objectIdParamSchema } from '../../../shared/validation/object-id.schema.js';

import { SESSION_LIST, SESSION_REVOKE } from '../../../shared/api-endpoint/session.api.endpoint.js';

const router = Router();

const sessionRepository = new SessionRepository();
const sessionService = new SessionService(sessionRepository);
const sessionController = new SessionController(sessionService);

router.get(
  SESSION_LIST,
  verifyjwt,
  handle(sessionController.list.bind(sessionController), mapSessionError),
);

router.delete(
  SESSION_REVOKE,
  verifyjwt,
  validate({ params: objectIdParamSchema('id') }),
  handle(sessionController.revoke.bind(sessionController), mapSessionError),
);

export default router;
