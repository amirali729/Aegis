import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().trim().min(2, 'Tenant name must be at least 2 characters.').max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens.')
    .optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).optional(),
});

export const updateTenantSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  status: z.enum(['active', 'suspended']).optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).optional(),
});
