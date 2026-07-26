import { openapiComponents } from './component.js';
import { authPaths } from '../../modules/auth/docs/auth.paths.js';
import { permissionPaths } from '../../modules/permission/docs/permission.paths.js';
import { rolePaths } from '../../modules/role/docs/role.paths.js';
import { tenantPaths } from '../../modules/tenant/docs/tenant.paths.js';
import { applicationPaths } from '../../modules/apikey/docs/apikey.paths.js';
import { healthPaths } from '../http/health.paths.js';

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
      { name: 'Permissions', description: 'RBAC building blocks (resource:action)' },
      { name: 'Roles', description: 'Named permission bundles, assignable to users' },
      { name: 'Tenants', description: 'Hosted SaaS customer isolation (MULTI_TENANT=true)' },
      {
        name: 'Applications',
        description: 'Registered consuming apps and their OAuth-style credentials',
      },
      { name: 'API Keys', description: 'Server-to-server credentials scoped to an Application' },
      { name: 'Health', description: 'Operational endpoints' },
    ],
    security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    components: openapiComponents,
    paths: {
      ...healthPaths,
      ...authPaths,
      ...permissionPaths,
      ...rolePaths,
      ...tenantPaths,
      ...applicationPaths,
    },
  };
}
