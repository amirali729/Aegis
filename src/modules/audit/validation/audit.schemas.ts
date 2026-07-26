import { z } from 'zod';

export const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  actorId: z.string().optional(),
  action: z.string().optional(),
  targetType: z.string().optional(),
  targetId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
