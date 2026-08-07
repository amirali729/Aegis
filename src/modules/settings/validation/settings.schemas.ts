import { z } from 'zod';

export const updateProfileSchema = z.object({
  bio: z.string().trim().max(500).optional(),
  avatarUrl: z.string().trim().url('Must be a valid URL.').max(2048).optional(),
  jobTitle: z.string().trim().max(100).optional(),
  company: z.string().trim().max(100).optional(),
  website: z.string().trim().url('Must be a valid URL.').max(200).optional(),
  location: z.string().trim().max(100).optional(),
});

const generalPreferencesSchema = z
  .object({
    timezone: z.string().trim().min(1).optional(),
    locale: z.string().trim().min(1).optional(),
    dateFormat: z.string().trim().min(1).optional(),
    defaultOrganizationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid organization id.')
      .optional(),
  })
  .strict();

const appearancePreferencesSchema = z
  .object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    density: z.enum(['comfortable', 'compact']).optional(),
    fontSize: z.enum(['small', 'medium', 'large']).optional(),
    reduceMotion: z.boolean().optional(),
  })
  .strict();

const notificationPreferencesSchema = z
  .object({
    emailEnabled: z.boolean().optional(),
    productUpdates: z.boolean().optional(),
    securityAlerts: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
  })
  .strict();

const privacyPreferencesSchema = z
  .object({
    profileVisibility: z.enum(['public', 'organization', 'private']).optional(),
    showEmail: z.boolean().optional(),
    showActivity: z.boolean().optional(),
    allowIndexing: z.boolean().optional(),
  })
  .strict();

const developerPreferencesSchema = z
  .object({
    apiAccessEnabled: z.boolean().optional(),
    betaFeaturesEnabled: z.boolean().optional(),
    showDeveloperTools: z.boolean().optional(),
  })
  .strict();

export const updatePreferencesSchema = z.object({
  general: generalPreferencesSchema.optional(),
  appearance: appearancePreferencesSchema.optional(),
  notifications: notificationPreferencesSchema.optional(),
  privacy: privacyPreferencesSchema.optional(),
  developer: developerPreferencesSchema.optional(),
});

export const disconnectAppParamsSchema = z.object({
  provider: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_-]+$/, 'Invalid provider.'),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required.'),
});
