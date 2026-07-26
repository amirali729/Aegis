import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z.string().trim().min(2, 'API key name must be at least 2 characters.').max(100),
  expiresInDays: z.number().int().positive().max(3650).optional(),
});
