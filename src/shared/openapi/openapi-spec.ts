import { openapiComponents } from './component.js';
import { applicationPaths } from './docs/application.docs.js';
import { auditPaths } from './docs/audit.docs.js';
import { authPaths } from './docs/auth.docs.js';
import { healthPaths } from './docs/health.docs.js';
import { permissionPaths } from './docs/permission.docs.js';
import { rolePaths } from './docs/role.docs.js';
import { sessionPaths } from './docs/session.docs.js';
import { tenantPaths } from './docs/tenant.docs.js';

export function buildOpenApiSpec() {
  const port = process.env.PORT ?? '5000';

  return {
    openapi: '3.0.3',
    info: {
      title: 'Identity Platform API',
      version: '1.0.0',
      description:
        'Authentication, authorization (RBAC), multi-tenancy, and application/API-key management for the Identity Platform. ' +
        'Every successful response is wrapped as `{ success, statusCode, message, data, timestamp }`; ' +
        'every error response as `{ success: false, statusCode, message, timestamp }`. ' +
        "Use the 'Authorize' button to set a bearer token, or log in via /auth/login from a browser to rely on cookies instead.",
      contact: { name: 'Identity Platform' },
    },
    servers: [{ url: `http://localhost:${port}`, description: 'Local' }],
    tags: [
      { name: 'Auth', description: 'Signup, login, sessions, password/email flows' },
      { name: 'Sessions', description: 'Multi-device session listing and revocation' },
      { name: 'Permissions', description: 'RBAC building blocks (resource:action)' },
      { name: 'Roles', description: 'Named permission bundles, assignable to users' },
      { name: 'Tenants', description: 'Hosted SaaS customer isolation (MULTI_TENANT=true)' },
      {
        name: 'Applications',
        description: 'Registered consuming apps and their OAuth-style credentials',
      },
      { name: 'API Keys', description: 'Server-to-server credentials scoped to an Application' },
      { name: 'Audit', description: 'Append-only security event log' },
      { name: 'Health', description: 'Operational endpoints' },
    ],
    security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    components: openapiComponents,
    paths: {
      ...healthPaths,
      ...authPaths,
      ...sessionPaths,
      ...auditPaths,
      ...permissionPaths,
      ...rolePaths,
      ...tenantPaths,
      ...applicationPaths,
    },
  };
}
