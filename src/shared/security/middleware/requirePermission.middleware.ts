import type { NextFunction, Request, Response } from 'express';
import { getUserPermissionKeys } from '../authorization/permission-evaluator.js';

/**
 * Requires the authenticated user (req.user, set by verifyjwt) to hold
 * EVERY permission key listed. Responds 403 if any is missing.
 *
 * Usage: router.post(path, verifyjwt, requirePermission("role:create"), handler)
 */
export function requirePermission(...requiredKeys: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const userPermissions = await getUserPermissionKeys(req.user._id.toString(), req.tenantId);

    const hasAll = requiredKeys.every((key) => userPermissions.has(key));

    if (!hasAll) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
}

/**
 * Requires the authenticated user to hold AT LEAST ONE of the listed
 * permission keys. Responds 403 if none match.
 */
export function requireAnyPermission(...allowedKeys: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const userPermissions = await getUserPermissionKeys(req.user._id.toString(), req.tenantId);

    const hasAny = allowedKeys.some((key) => userPermissions.has(key));

    if (!hasAny) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
}
