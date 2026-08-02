import { z } from 'zod';

/** RFC 7636 - base64url, 43-128 chars (a base64url SHA-256 digest is 43 chars). */
const codeChallengeSchema = z
  .string()
  .regex(/^[A-Za-z0-9\-_]{43,128}$/, 'code_challenge must be a valid base64url-encoded value.');

export const authorizeQuerySchema = z.object({
  response_type: z.literal('code', {
    message: 'response_type must be "code" - Aegis only supports the authorization code flow.',
  }),
  client_id: z.string().min(1, 'client_id is required.'),
  redirect_uri: z.string().url('redirect_uri must be a valid URL.'),
  scope: z.string().optional(),
  state: z.string().max(512).optional(),
  code_challenge: codeChallengeSchema,
  code_challenge_method: z.literal('S256', {
    message: 'code_challenge_method must be "S256" - the plain method is not supported.',
  }),
});

export type AuthorizeQuery = z.infer<typeof authorizeQuerySchema>;

/**
 * The frontend consent page resubmits the exact same authorize params it
 * received in its own query string (see AuthorizeService, the
 * consent_required outcome), plus the user's approve/deny decision.
 */
export const consentDecisionSchema = authorizeQuerySchema.extend({
  approved: z.boolean(),
});
