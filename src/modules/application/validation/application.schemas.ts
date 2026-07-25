import { z } from 'zod';

const originListSchema = z.array(z.string().trim().min(1)).optional();

const uriListSchema = z.array(z.string().trim().url('Must be a valid URL.')).optional();

export const createApplicationSchema = z.object({
  name: z.string().trim().min(2, 'Application name must be at least 2 characters.').max(100),
  allowedOrigins: originListSchema,
  redirectUris: uriListSchema,
  accessTokenTTL: z.string().trim().optional(),
  refreshTokenTTL: z.string().trim().optional(),
});

export const updateApplicationSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  allowedOrigins: originListSchema,
  redirectUris: uriListSchema,
  accessTokenTTL: z.string().trim().optional(),
  refreshTokenTTL: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const createApiKeySchema = z.object({
  name: z.string().trim().min(2, 'API key name must be at least 2 characters.').max(100),
  expiresInDays: z.number().int().positive().max(3650).optional(),
});
