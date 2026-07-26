import type { Request, Response, NextFunction } from 'express';

/**
 * Self-hosted deployments typically run a single tenant and don't need
 * resolution at all (see docs/Multi-Tenant & SaaS Architecture.md,
 * section 15). Set MULTI_TENANT=true in .env to enable it for Hosted
 * SaaS-style deployments.
 */
function isMultiTenantEnabled(): boolean {
  return process.env.MULTI_TENANT === 'true';
}

/**
 * Resolves req.tenantId from (in priority order): an explicit
 * X-Tenant-ID header, or the authenticated user's own tenantId once
 * user-level tenant scoping is wired up. Does not reject the request
 * if no tenant is found - individual routes decide whether a tenant is
 * required (e.g. application creation just omits tenantId when absent).
 */
export function resolveTenant(req: Request, _res: Response, next: NextFunction) {
  if (!isMultiTenantEnabled()) {
    return next();
  }

  const headerTenantId = req.headers['x-tenant-id'];

  if (typeof headerTenantId === 'string' && headerTenantId) {
    req.tenantId = headerTenantId;
  }

  next();
}

/**
 * Use on routes that must not proceed without a resolved tenant (e.g.
 * platform-admin-only actions in a hosted deployment). No-ops when
 * MULTI_TENANT is disabled.
 */
export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!isMultiTenantEnabled()) {
    return next();
  }

  if (!req.tenantId) {
    return res.status(400).json({
      message: 'A tenant could not be resolved for this request (missing X-Tenant-ID header).',
    });
  }

  next();
}
