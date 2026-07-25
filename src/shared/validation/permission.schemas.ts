import { z } from 'zod';

export const createPermissionSchema = z.object({
  key: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]+:[a-z0-9_]+$/, "Permission key must follow the 'resource:action' format."),
  description: z.string().trim().max(300).optional(),
});

export const updatePermissionSchema = z.object({
  description: z.string().trim().max(300).optional(),
});
