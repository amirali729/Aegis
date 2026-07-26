import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import applicationRouter from './modules/application/routes/application.routes.js';
import authRouter from './modules/auth/routes/auth.routes.js';
import permissionRouter from './modules/permission/routes/permission.routes.js';
import roleRouter from './modules/role/routes/role.routes.js';
import sessionRouter from './modules/session/routes/session.routes.js';
import tenantRouter from './modules/tenant/routes/tenant.routes.js';
import healthRouter from './shared/http/health.router.js';
import swaggerRouter from './shared/openapi/swagger.routes.js';

import { errorHandler, notFoundHandler } from './shared/http/error-handler.js';
import { globalRateLimiter } from './shared/security/middleware/rate-limit.middleware.js';
import { Logger } from './shared/utils/logger.js';

export function createApp() {
  const app = express();

  if (!process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN missing in .env');
  }

  // Security headers (HSTS, X-Content-Type-Options, etc.). CSP is
  // disabled because Swagger UI (mounted below at /api/docs) needs
  // inline scripts/styles to render; this is an API service with no
  // other browser-rendered surface, so the trade-off is acceptable.
  app.use(helmet({ contentSecurityPolicy: false }));

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  // Request logging - routed through the shared Logger so log format
  // stays consistent whether it comes from morgan or app code.
  app.use(
    morgan('tiny', {
      stream: {
        write: (message) => Logger.info(message.trim()),
      },
    }),
  );

  app.use(express.json({ limit: '16kb' }));
  app.use(express.urlencoded({ extended: true, limit: '16kb' }));
  app.use(express.static('public'));
  app.use(cookieParser());

  // Backstop rate limit across the whole API; individual auth routes
  // layer stricter limits on top (see auth.router.ts).
  app.use(globalRateLimiter);

  app.use('/health', healthRouter);
  app.use('/api/docs', swaggerRouter);

  app.use('/api/v1', authRouter);
  app.use('/api/v1', permissionRouter);
  app.use('/api/v1', roleRouter);
  app.use('/api/v1', tenantRouter);
  app.use('/api/v1', applicationRouter);
  app.use('/api/v1', sessionRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
