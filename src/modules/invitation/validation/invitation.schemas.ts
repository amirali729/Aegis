import { z } from 'zod';
import { objectIdSchema } from '../../../shared/validation/object-id.schema.js';

export const orgIdParamSchema = z.object({
  orgId: objectIdSchema,
});

export const orgAndInvitationIdParamSchema = z.object({
  orgId: objectIdSchema,
  invitationId: objectIdSchema,
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please provide a valid email address.'),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'token is required.'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username must be at most 30 characters.')
    .regex(/^[a-z0-9_]+$/, 'Username may only contain lowercase letters, numbers, and underscores.')
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password must be at most 128 characters.')
    .optional(),
});
