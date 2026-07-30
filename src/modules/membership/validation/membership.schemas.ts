import { z } from 'zod';
import { objectIdSchema } from '../../../shared/validation/object-id.schema.js';

export const orgIdParamSchema = z.object({
  orgId: objectIdSchema,
});

export const orgAndUserIdParamSchema = z.object({
  orgId: objectIdSchema,
  userId: objectIdSchema,
});
