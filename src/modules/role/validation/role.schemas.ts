import { z } from 'zod';
import { objectIdSchema } from '../../../shared/validation/object-id.schema.js';

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Role name must be at least 2 characters.')
    .max(50, 'Role name must be at most 50 characters.'),
  description: z.string().trim().max(300).optional(),
  permissionIds: z.array(objectIdSchema).optional().default([]),
});

export const updateRoleSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  description: z.string().trim().max(300).optional(),
});

export const setRolePermissionsSchema = z.object({
  permissionIds: z.array(objectIdSchema).default([]),
});

export const assignRoleBodySchema = z.object({
  roleId: objectIdSchema,
});

export const assignRoleParamsSchema = z.object({
  orgId: objectIdSchema,
  userId: objectIdSchema,
});

export const removeRoleParamsSchema = z.object({
  orgId: objectIdSchema,
  userId: objectIdSchema,
  roleId: objectIdSchema,
});
